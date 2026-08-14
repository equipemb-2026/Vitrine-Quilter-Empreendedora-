import { ApiPiecesResponse } from '../types.ts';

/**
 * Serviço de comunicação com a API /api/pieces
 */
export async function fetchPieces(forceRefresh: boolean = false): Promise<ApiPiecesResponse> {
  const url = forceRefresh ? '/api/pieces?refresh=true' : '/api/pieces';
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  const data: ApiPiecesResponse = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Erro na requisição: ${res.status} ${res.statusText}`);
  }

  return data;
}

