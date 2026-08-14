import { ApiPiecesResponse, QuilterPiece } from '../types.ts';
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
 * Serviço de comunicação com a API /api/pieces com timeout de 15s via AbortController
 */
export async function fetchPieces(forceRefresh: boolean = false, signal?: AbortSignal): Promise<{ success: boolean; pieces: QuilterPiece[]; total: number; error?: string }> {
  const url = forceRefresh ? '/api/pieces?refresh=true' : '/api/pieces';
  
  // Timeout de 15 segundos no frontend
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  // Escuta se um signal externo foi cancelado
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    if (netErr?.name === 'AbortError') {
      throw new Error('O tempo de conexão com a vitrine expirou. Por favor, tente novamente.');
    }
    throw new Error(extractErrorMessage(netErr));
  }
}



