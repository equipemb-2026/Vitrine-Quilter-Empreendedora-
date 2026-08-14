import { ApiPiecesResponse } from '../types.ts';

/**
 * Utilitário para extrair mensagem legível de erros diversos
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Ocorreu um erro ao carregar as peças da vitrine.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const obj = err as Record<string, any>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error?.message === 'string') return obj.error.message;
    try {
      const serialized = JSON.stringify(err);
      if (serialized !== '{}') return serialized;
    } catch {
      // Ignora erro de serialização
    }
  }
  return 'Ocorreu um erro ao comunicar com o servidor da vitrine.';
}

/**
 * Serviço de comunicação com a API /api/pieces
 */
export async function fetchPieces(forceRefresh: boolean = false): Promise<ApiPiecesResponse> {
  const url = forceRefresh ? '/api/pieces?refresh=true' : '/api/pieces';
  
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (netErr: any) {
    throw new Error(extractErrorMessage(netErr) || 'Falha de conexão com a API.');
  }

  let data: any = null;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      throw new Error(`Resposta inválida do servidor (HTTP ${res.status}).`);
    }
  } else {
    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(
        `Erro no servidor (HTTP ${res.status})${rawText ? `: ${rawText.slice(0, 120)}` : ''}`
      );
    }
    throw new Error('A API retornou uma resposta não compatível (não-JSON).');
  }

  if (!res.ok || data?.success === false) {
    const message = extractErrorMessage(data?.error || data?.message || `Erro na requisição: HTTP ${res.status}`);
    throw new Error(message);
  }

  return data as ApiPiecesResponse;
}


