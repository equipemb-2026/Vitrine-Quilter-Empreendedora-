import { QuilterPiece } from '../types.ts';

const CACHE_KEY = 'quilter_vitrine_pieces_cache';

interface CachedPayload {
  pieces: QuilterPiece[];
  timestamp: number;
}

/**
 * Recupera o último array de peças salvo com sucesso na sessão do navegador
 */
export function getSessionCachedPieces(): QuilterPiece[] | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedPayload = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.pieces) && parsed.pieces.length > 0) {
      return parsed.pieces;
    }
  } catch (err) {
    console.warn('[Cache] Não foi possível ler sessionStorage:', err);
  }

  return null;
}

/**
 * Salva o array de peças da vitrine no sessionStorage
 */
export function saveSessionCachedPieces(pieces: QuilterPiece[]): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  if (!Array.isArray(pieces) || pieces.length === 0) {
    return;
  }

  try {
    const payload: CachedPayload = {
      pieces,
      timestamp: Date.now(),
    };
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[Cache] Não foi possível salvar em sessionStorage:', err);
  }
}
