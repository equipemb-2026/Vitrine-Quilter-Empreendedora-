import { QuilterPiece } from '../types.ts';
import { normalizePiecesList } from '../utils/normalizeUtils.ts';

/**
 * Utilitário para extrair mensagem legível de erros diversos sem expor objetos ou jargão técnico
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Não foi possível carregar a vitrine.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) {
    if (err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('timeout')) {
      return 'O tempo de resposta foi excedido. Por favor, verifique a conexão e tente novamente.';
    }
    return err.message;
  }
  if (typeof err === 'object') {
    const obj = err as Record<string, any>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error?.message === 'string') return obj.error.message;
  }
  return 'Não foi possível carregar a vitrine.';
}

/**
 * Executa uma requisição individual para /api/pieces com timeout de 20s
 */
export async function fetchPiecesOnce(
  forceRefresh: boolean = false,
  parentSignal?: AbortSignal
): Promise<{ success: boolean; pieces: QuilterPiece[]; total: number }> {
  const url = forceRefresh ? '/api/pieces?refresh=true' : '/api/pieces';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000); // 20 segundos de timeout para acomodar cold start do Apps Script

  const onParentAbort = () => {
    clearTimeout(timeoutId);
    controller.abort();
  };

  if (parentSignal) {
    if (parentSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      parentSignal.addEventListener('abort', onParentAbort);
    }
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (parentSignal) {
      parentSignal.removeEventListener('abort', onParentAbort);
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        throw new Error('Não foi possível processar os dados da vitrine.');
      }
    } else {
      throw new Error('Não foi possível conectar com o serviço da vitrine.');
    }

    if (!res.ok || data?.success === false) {
      const message = extractErrorMessage(data?.error || data?.message || 'Não foi possível carregar a vitrine.');
      throw new Error(message);
    }

    const rawPieces = Array.isArray(data?.pieces) ? data.pieces : [];
    const normalizedPieces = normalizePiecesList(rawPieces);

    return {
      success: true,
      pieces: normalizedPieces,
      total: normalizedPieces.length,
    };
  } catch (netErr: any) {
    clearTimeout(timeoutId);
    if (parentSignal) {
      parentSignal.removeEventListener('abort', onParentAbort);
    }

    if (netErr?.name === 'AbortError' || controller.signal.aborted) {
      if (parentSignal?.aborted) {
        throw new Error('Operação cancelada.');
      }
      throw new Error('O tempo de conexão com a vitrine expirou. Por favor, tente novamente.');
    }
    throw new Error(extractErrorMessage(netErr));
  }
}

/**
 * Serviço de busca com retry automático (Tentativa 1 -> espera 1,5s -> Tentativa 2)
 */
export async function fetchPieces(
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<{ success: boolean; pieces: QuilterPiece[]; total: number }> {
  try {
    return await fetchPiecesOnce(forceRefresh, signal);
  } catch (firstErr: any) {
    if (signal?.aborted) {
      throw firstErr;
    }

    console.warn('[Vitrine] 1ª tentativa falhou. Aguardando 1.5s para retry automático...', firstErr?.message);
    
    // Aguarda 1.5s antes da 2ª tentativa
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (signal?.aborted) {
      throw new Error('Operação cancelada.');
    }

    // 2ª tentativa (sem loops adicionais)
    return await fetchPiecesOnce(forceRefresh, signal);
  }
}




