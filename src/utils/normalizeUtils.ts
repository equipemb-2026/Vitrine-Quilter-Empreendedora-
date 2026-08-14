import { QuilterPiece } from '../types.ts';

/**
 * Utilitários para normalização de dados e buscas com suporte a caracteres acentuados
 */

/**
 * Normaliza texto para busca textual sem acentos, sem maiúsculas e sem espaços extras
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normaliza o status da peça garantindo os 3 valores válidos: Disponível | Reservada | Vendida
 */
export function normalizePieceStatus(status: unknown): 'Disponível' | 'Reservada' | 'Vendida' {
  if (!status) return 'Disponível';
  const str = String(status).trim().toLowerCase();
  if (str.includes('reservad') || str.includes('negocia')) return 'Reservada';
  if (str.includes('vendid')) return 'Vendida';
  return 'Disponível';
}

/**
 * Normaliza o valor booleano do selo Master
 */
export function normalizeMasterFlag(master: unknown): boolean {
  if (typeof master === 'boolean') return master;
  if (!master) return false;
  const str = String(master).trim().toLowerCase();
  return str === 'true' || str === 'sim' || str === '1' || str === 'yes' || str === 'v';
}

/**
 * Normaliza preço numérico com segurança
 */
export function normalizePrice(price: unknown): number {
  if (typeof price === 'number' && Number.isFinite(price)) {
    return Math.max(0, price);
  }
  if (!price) return 0;
  
  const clean = String(price).replace(/[^\d.,]/g, '').trim();
  if (!clean) return 0;
  
  const normalized = clean.includes(',') 
    ? clean.replace(/\./g, '').replace(',', '.') 
    : clean;
    
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Normaliza arrays de strings limpando itens nulos, vazios ou duplicados
 */
export function normalizeStringArray(items: unknown): string[] {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0);
  }
  if (typeof items === 'string') {
    return items
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

/**
 * Normaliza um objeto de peça bruto recebido da API para a interface QuilterPiece
 */
export function normalizePiece(raw: any, index: number = 0): QuilterPiece {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `QES-${String(index + 1).padStart(4, '0')}`,
      author: 'Artesã',
      title: 'Peça Artesanal',
      description: '',
      size: '',
      price: 0,
      city: '',
      state: '',
      cep: '',
      master: false,
      courses: [],
      payments: [],
      shipping: [],
      status: 'Disponível',
      images: { front: '', back: '', detail: '' },
      whatsapp: '',
      publishedAt: '',
    };
  }

  const rawImages = raw.images || {};
  const frontImg = typeof rawImages.front === 'string' ? rawImages.front.trim() : (typeof raw.front === 'string' ? raw.front.trim() : '');
  const backImg = typeof rawImages.back === 'string' ? rawImages.back.trim() : (typeof raw.back === 'string' ? raw.back.trim() : '');
  const detailImg = typeof rawImages.detail === 'string' ? rawImages.detail.trim() : (typeof raw.detail === 'string' ? raw.detail.trim() : '');

  const id = String(raw.id || `QES-${String(index + 1).padStart(4, '0')}`).trim();
  const author = String(raw.author || raw.name || 'Artesã').replace(/\s+/g, ' ').trim();
  const title = String(raw.title || 'Peça Artesanal').replace(/\s+/g, ' ').trim();
  const description = String(raw.description || '').trim();
  const size = String(raw.size || '').trim();
  const city = String(raw.city || '').trim();
  const state = String(raw.state || '').trim().toUpperCase();
  const cep = String(raw.cep || '').replace(/\D/g, '');
  const whatsapp = String(raw.whatsapp || '').trim();
  const publishedAt = String(raw.publishedAt || raw.published_at || '').trim();

  return {
    id,
    author,
    title,
    description,
    size,
    price: normalizePrice(raw.price),
    city,
    state,
    cep,
    master: normalizeMasterFlag(raw.master),
    courses: normalizeStringArray(raw.courses),
    payments: normalizeStringArray(raw.payments),
    shipping: normalizeStringArray(raw.shipping),
    status: normalizePieceStatus(raw.status),
    images: {
      front: frontImg,
      back: backImg,
      detail: detailImg,
    },
    whatsapp,
    publishedAt,
  };
}

/**
 * Normaliza a lista completa de peças
 */
export function normalizePiecesList(rawPieces: unknown): QuilterPiece[] {
  if (!Array.isArray(rawPieces)) return [];
  return rawPieces
    .filter((p) => p && typeof p === 'object')
    .map((p, idx) => normalizePiece(p, idx));
}
