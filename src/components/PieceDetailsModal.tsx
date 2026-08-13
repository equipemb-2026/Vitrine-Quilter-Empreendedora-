import React, { useEffect } from 'react';
import { X, MapPin, Ruler, CreditCard, Truck, GraduationCap, ShieldCheck, Heart } from 'lucide-react';
import { QuilterPiece } from '../types.ts';
import { MasterBadge } from './MasterBadge.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { WhatsAppButton } from './WhatsAppButton.tsx';
import { ImageGallery } from './ImageGallery.tsx';
import { formatCurrency, formatCep } from '../utils/formatUtils.ts';

interface PieceDetailsModalProps {
  piece: QuilterPiece | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PieceDetailsModal: React.FC<PieceDetailsModalProps> = ({ piece, isOpen, onClose }) => {
  // Fecha no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Previne rolagem de fundo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !piece) return null;

  return (
    <div
      id="modal-piece-details-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-piece-title"
    >
      <div
        id="modal-piece-details-content"
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de controle */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
              {piece.id}
            </span>
            <StatusBadge status={piece.status} />
            {piece.master && <MasterBadge size="sm" />}
          </div>

          <button
            type="button"
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300"
            aria-label="Fechar detalhes da peça"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal com rolagem */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Coluna Esquerda: Galeria de Fotos */}
            <div className="md:col-span-6">
              <ImageGallery
                images={piece.images}
                title={piece.title}
                author={piece.author}
              />

              <p className="text-[11px] text-stone-400 text-center mt-3">
                * Clique na imagem para ampliá-la em alta resolução.
              </p>
            </div>

            {/* Coluna Direita: Informações e Compra */}
            <div className="md:col-span-6 flex flex-col space-y-6">
              <div>
                <h2
                  id="modal-piece-title"
                  className="text-2xl sm:text-3xl font-serif-display font-semibold text-stone-900 leading-tight"
                >
                  {piece.title}
                </h2>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-stone-500">Criada por:</span>
                  <span className="text-base font-semibold text-rose-950">
                    {piece.author}
                  </span>
                </div>
              </div>

              {/* Bloco de Preço */}
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-stone-500 uppercase tracking-wider block font-medium">
                    Valor da Peça
                  </span>
                  <span className="text-3xl font-serif-display font-bold text-stone-900">
                    {formatCurrency(piece.price)}
                  </span>
                </div>
                <StatusBadge status={piece.status} className="text-xs" />
              </div>

              {/* Botão de Compra WhatsApp */}
              <div className="space-y-2">
                <WhatsAppButton piece={piece} variant="full" />
                <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Você conversará diretamente com a artesã no WhatsApp.</span>
                </p>
              </div>

              {/* Descrição Completa */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-600">
                  Sobre a Peça
                </h3>
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                  {piece.description || 'Peça artesanal exclusiva produzida com carinho e técnicas refinadas de quilting.'}
                </p>
              </div>

              {/* Especificações Técnicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-sm">
                {/* Medidas */}
                <div className="flex items-start space-x-2.5">
                  <Ruler className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-stone-500 block">Medidas / Tamanho</span>
                    <span className="font-medium text-stone-800">{piece.size || 'Consulte com a autora'}</span>
                  </div>
                </div>

                {/* Localização */}
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-stone-500 block">Origem</span>
                    <span className="font-medium text-stone-800">
                      {piece.city && piece.state ? `${piece.city} - ${piece.state}` : 'Brasil'}
                      {piece.cep && <span className="text-xs text-stone-500 block">CEP: {formatCep(piece.cep)}</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagamentos e Envios */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                {piece.payments && piece.payments.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-stone-500 mb-2 font-medium">
                      <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                      <span>Formas de Pagamento Aceitas</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {piece.payments.map((pay, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium"
                        >
                          {pay}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {piece.shipping && piece.shipping.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-stone-500 mb-2 font-medium">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      <span>Opções de Envio</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {piece.shipping.map((ship, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium"
                        >
                          {ship}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {piece.courses && piece.courses.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-stone-500 mb-2 font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                      <span>Comunidade / Curso</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {piece.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium border border-rose-100"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Aviso Amigável de Funcionamento da Vitrine */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold text-amber-950">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Apoio ao Artesanato Autoral</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  A Vitrine Quilter Empreendedora é uma vitrine de divulgação e conexão. Todo o valor arrecadado vai integralmente para a artesã, sem taxas intermediárias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
