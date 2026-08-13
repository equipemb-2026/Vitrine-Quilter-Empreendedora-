import React, { useState } from 'react';
import { MapPin, Ruler, Eye, ImageOff } from 'lucide-react';
import { QuilterPiece } from '../types.ts';
import { MasterBadge } from './MasterBadge.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';
import { formatCurrency, truncateText } from '../utils/formatUtils.ts';

interface PieceCardProps {
  piece: QuilterPiece;
  onOpenDetails: (piece: QuilterPiece) => void;
}

export const PieceCard: React.FC<PieceCardProps> = ({ piece, onOpenDetails }) => {
  const [imgError, setImgError] = useState(false);
  const frontImageUrl = piece.images?.front || '';

  return (
    <article
      id={`card-piece-${piece.id}`}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-rose-200/80 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Container da Imagem com Badges Flutuantes */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer">
        {!imgError && frontImageUrl ? (
          <img
            src={frontImageUrl}
            alt={`Peça ${piece.title} confeccionada por ${piece.author}`}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onClick={() => onOpenDetails(piece)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            onClick={() => onOpenDetails(piece)}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-stone-400 bg-stone-100/90 hover:bg-stone-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-stone-200/70 flex items-center justify-center mb-2">
              <ImageOff className="w-6 h-6 text-stone-400" />
            </div>
            <span className="text-xs font-medium text-stone-500">Foto em processamento</span>
          </div>
        )}

        {/* Overlay sutil ao passar o mouse */}
        <div
          onClick={() => onOpenDetails(piece)}
          className="absolute inset-0 bg-stone-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-stone-900 text-xs font-medium shadow-md flex items-center space-x-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>Ver detalhes</span>
          </span>
        </div>

        {/* Badges superiores */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between pointer-events-none gap-2">
          <div>
            {piece.master && (
              <div className="pointer-events-auto">
                <MasterBadge size="sm" />
              </div>
            )}
          </div>
          <div className="pointer-events-auto">
            <StatusBadge status={piece.status} />
          </div>
        </div>

        {/* Tag de Código ID */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-stone-900/70 backdrop-blur-xs text-white text-[11px] font-mono">
            {piece.id}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
        {/* Cabeçalho do Card: Autora e Título */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-rose-900/80 mb-1">
            {piece.author}
          </div>
          <h3
            onClick={() => onOpenDetails(piece)}
            className="text-lg font-serif-display font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-rose-950 transition-colors cursor-pointer"
            title={piece.title}
          >
            {piece.title}
          </h3>
        </div>

        {/* Descrição resumida */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {truncateText(piece.description || 'Peça artesanal exclusiva produzida com carinho e técnicas refinadas de quilting.', 100)}
        </p>

        {/* Metadados: Tamanho e Localização */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
          <div className="flex items-center space-x-1.5 truncate max-w-[50%]" title={piece.size || 'Consulte o tamanho'}>
            <Ruler className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{piece.size || 'Sob consulta'}</span>
          </div>

          <div className="flex items-center space-x-1.5 truncate max-w-[50%]" title={`${piece.city} - ${piece.state}`}>
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{piece.city ? `${piece.city}, ${piece.state}` : 'Brasil'}</span>
          </div>
        </div>

        {/* Preço e Botões de Ação */}
        <div className="pt-3 border-t border-stone-100 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400 uppercase font-medium">Investimento</span>
            <span className="text-xl font-serif-display font-bold text-stone-900">
              {formatCurrency(piece.price)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id={`btn-view-details-${piece.id}`}
              onClick={() => onOpenDetails(piece)}
              className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl border border-stone-300/80 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
              <span>Ver detalhes</span>
            </button>

            <WhatsAppButton piece={piece} variant="primary" />
          </div>
        </div>
      </div>
    </article>
  );
};
