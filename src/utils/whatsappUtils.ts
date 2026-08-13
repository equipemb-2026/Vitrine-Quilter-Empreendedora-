import { QuilterPiece } from '../types.ts';
import { formatCurrency } from './formatUtils.ts';

/**
 * Normaliza o telefone para o formato internacional exigido pelo WhatsApp (wa.me)
 * Regra: Remover espaços, parênteses, hífens e caracteres não numéricos.
 * Se o número possuir apenas DDD + telefone brasileiro (10 ou 11 dígitos), acrescentar o código 55.
 */
export function normalizeWhatsAppNumber(rawPhone: string | null | undefined): string {
  if (!rawPhone) return '';

  const cleanDigits = String(rawPhone).replace(/\D/g, '');

  if (!cleanDigits) return '';

  // Se tem 10 ou 11 dígitos (ex: 48999999999 ou 4833334444), adiciona o DDI 55
  if (cleanDigits.length === 10 || cleanDigits.length === 11) {
    return `55${cleanDigits}`;
  }

  // Se já tem 12 ou 13 dígitos começando com 55
  if (cleanDigits.startsWith('55') && (cleanDigits.length === 12 || cleanDigits.length === 13)) {
    return cleanDigits;
  }

  // Se tem 0 no início (ex: 048999999999), remove o 0 inicial e confere
  if (cleanDigits.startsWith('0')) {
    const withoutZero = cleanDigits.replace(/^0+/, '');
    if (withoutZero.length === 10 || withoutZero.length === 11) {
      return `55${withoutZero}`;
    }
  }

  return cleanDigits;
}

/**
 * Gera a mensagem padrão sanitizada para o contato de compra
 * Template: "Olá, {author}! Vi a peça \"{title}\" ({id}), no valor de {formattedPrice}, na Vitrine do Desafio Quilter Empreendedora 2026 e gostaria de saber se ela ainda está disponível."
 */
export function buildWhatsAppMessage(piece: QuilterPiece): string {
  const formattedPrice = formatCurrency(piece.price);
  const cleanTitle = (piece.title || '').trim();
  const cleanAuthor = (piece.author || '').trim();
  const cleanId = (piece.id || '').trim();

  return `Olá, ${cleanAuthor}! Vi a peça "${cleanTitle}" (${cleanId}), no valor de ${formattedPrice}, na Vitrine do Desafio Quilter Empreendedora 2026 e gostaria de saber se ela ainda está disponível.`;
}

/**
 * Gera a URL completa do WhatsApp (wa.me)
 */
export function getWhatsAppUrl(piece: QuilterPiece): string {
  const normalizedPhone = normalizeWhatsAppNumber(piece.whatsapp);
  const message = buildWhatsAppMessage(piece);
  const encodedMessage = encodeURIComponent(message);

  if (!normalizedPhone) {
    return '#';
  }

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
