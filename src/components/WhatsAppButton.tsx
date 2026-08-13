import React from 'react';
import { MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { QuilterPiece } from '../types.ts';
import { getWhatsAppUrl, normalizeWhatsAppNumber } from '../utils/whatsappUtils.ts';

interface WhatsAppButtonProps {
  piece: QuilterPiece;
  variant?: 'primary' | 'compact' | 'full';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  piece,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const isSold = piece.status === 'Vendida';
  const isReserved = piece.status === 'Reservada';
  const hasPhone = Boolean(normalizeWhatsAppNumber(piece.whatsapp));
  const whatsappUrl = getWhatsAppUrl(piece);

  let label = 'Quero comprar';
  if (isSold) {
    label = 'Peça vendida';
  } else if (isReserved) {
    label = 'Consultar disponibilidade';
  }

  // Base styles
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  if (isSold) {
    return (
      <button
        id={`btn-whatsapp-sold-${piece.id}`}
        type="button"
        disabled
        aria-disabled="true"
        className={`${baseClasses} bg-stone-200 text-stone-500 cursor-not-allowed px-4 py-2.5 text-sm w-full opacity-80 ${className}`}
      >
        <CheckCircle className="w-4 h-4 mr-2 text-stone-400" />
        <span>{label}</span>
      </button>
    );
  }

  if (!hasPhone) {
    return (
      <button
        id={`btn-whatsapp-nophone-${piece.id}`}
        type="button"
        disabled
        aria-disabled="true"
        className={`${baseClasses} bg-stone-200 text-stone-500 cursor-not-allowed px-4 py-2.5 text-sm w-full ${className}`}
        title="WhatsApp não cadastrado para esta peça"
      >
        <AlertCircle className="w-4 h-4 mr-2 text-stone-400" />
        <span>Contato indisponível</span>
      </button>
    );
  }

  // Active button styling
  const variantStyles = {
    primary: isReserved
      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500 px-4 py-2.5 text-sm w-full'
      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs hover:shadow-md focus:ring-emerald-500 px-4 py-2.5 text-sm w-full',
    compact: isReserved
      ? 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs',
    full: isReserved
      ? 'bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 text-base font-semibold shadow-md hover:shadow-lg w-full'
      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-6 py-3.5 text-base font-semibold shadow-md hover:shadow-lg w-full',
  };

  const Icon = isReserved ? Clock : MessageCircle;

  return (
    <a
      id={`btn-whatsapp-${piece.id}`}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      aria-label={`Entrar em contato via WhatsApp com ${piece.author} para a peça ${piece.title}`}
    >
      <Icon className={`${variant === 'compact' ? 'w-3.5 h-3.5 mr-1.5' : 'w-4 h-4 mr-2'} shrink-0`} />
      <span className="truncate">{label}</span>
    </a>
  );
};
