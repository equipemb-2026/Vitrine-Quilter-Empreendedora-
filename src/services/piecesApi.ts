import { ApiPiecesResponse, QuilterPiece } from '../types.ts';
import { MOCK_PIECES } from '../data/mockPieces.ts';

/**
 * Serviço de comunicação com a API /api/pieces
 */
export async function fetchPieces(forceRefresh: boolean = false): Promise<ApiPiecesResponse> {
  try {
    const url = forceRefresh ? '/api/pieces?refresh=true' : '/api/pieces';
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status} ${res.statusText}`);
    }

    const data: ApiPiecesResponse = await res.json();
    return data;
  } catch (error: any) {
    console.warn('Falha na requisição para /api/pieces, acionando fallback local:', error.message);
    
    // Fallback de segurança caso o backend esteja iniciando
    return {
      success: true,
      pieces: MOCK_PIECES,
      isMock: true,
      total: MOCK_PIECES.length,
      warning: 'Carregado via demonstração local.',
    };
  }
}
