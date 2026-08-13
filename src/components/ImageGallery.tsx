import React, { useState } from 'react';
import { Maximize2, ImageOff, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieceImages } from '../types.ts';

interface ImageGalleryProps {
  images: PieceImages;
  title: string;
  author: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, author }) => {
  // Monta a lista de imagens disponíveis
  const availableImages = [
    { key: 'front', label: 'Frente', url: images.front },
    { key: 'back', label: 'Verso', url: images.back },
    { key: 'detail', label: 'Detalhe', url: images.detail },
  ].filter((img) => Boolean(img.url && img.url.trim() !== ''));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeImage = availableImages[currentIndex] || { key: 'front', label: 'Frente', url: images.front };
  const hasFailed = failedImages[activeImage.url || ''];

  const handleImageError = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }));
  };

  const nextImage = () => {
    if (availableImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % availableImages.length);
    }
  };

  const prevImage = () => {
    if (availableImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
    }
  };

  return (
    <div id="image-gallery-container" className="flex flex-col space-y-3">
      {/* Imagem Principal */}
      <div className="relative aspect-4/3 w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/80 shadow-inner group">
        {!hasFailed && activeImage.url ? (
          <img
            src={activeImage.url}
            alt={`${title} - Foto ${activeImage.label} por ${author}`}
            loading="eager"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102 cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
            onError={() => handleImageError(activeImage.url!)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-6 bg-stone-100/80">
            <div className="w-12 h-12 rounded-full bg-stone-200/70 flex items-center justify-center mb-2">
              <ImageOff className="w-6 h-6 text-stone-400" />
            </div>
            <span className="text-sm font-medium text-stone-500">Fotografia em processamento</span>
            <span className="text-xs text-stone-400 mt-0.5">Visão {activeImage.label}</span>
          </div>
        )}

        {/* Botão de Ampliação */}
        {!hasFailed && activeImage.url && (
          <button
            type="button"
            id="btn-zoom-image"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-stone-900/60 hover:bg-stone-900/80 text-white backdrop-blur-xs transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Ampliar fotografia"
            title="Ampliar fotografia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Tag da Visão Atual */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/60 backdrop-blur-xs text-white text-xs font-medium tracking-wide">
          {activeImage.label}
        </span>

        {/* Navegação Rápida sobre a imagem */}
        {availableImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {availableImages.length > 1 && (
        <div id="gallery-thumbnails" className="flex items-center gap-2 overflow-x-auto pb-1">
          {availableImages.map((img, idx) => {
            const isSelected = idx === currentIndex;
            const imgFailed = failedImages[img.url || ''];

            return (
              <button
                key={img.key}
                type="button"
                id={`btn-thumbnail-${img.key}`}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex-1 min-w-[70px] max-w-[90px] aspect-4/3 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-300 ring-offset-1 shadow-xs'
                    : 'border-stone-200 opacity-70 hover:opacity-100'
                }`}
              >
                {!imgFailed && img.url ? (
                  <img
                    src={img.url}
                    alt={`${title} - Miniatura ${img.label}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(img.url!)}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <span className="text-[10px] text-stone-400">{img.label}</span>
                  </div>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-stone-900/60 text-white text-[9px] font-medium text-center py-0.5 backdrop-blur-2xs">
                  {img.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal de Ampliação */}
      {isLightboxOpen && !hasFailed && activeImage.url && (
        <div
          id="lightbox-backdrop"
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            id="btn-close-lightbox"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:outline-none"
            aria-label="Fechar ampliação"
          >
            <X className="w-6 h-6" />
          </button>

          {availableImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:outline-none"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors focus:outline-none"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.url}
              alt={`${title} - Foto ampliada (${activeImage.label})`}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-3 text-center text-stone-300 text-sm">
              <span className="font-semibold text-white">{title}</span> — Visão {activeImage.label} ({currentIndex + 1} de {availableImages.length})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
