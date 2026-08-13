import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer" className="mt-20 border-t border-stone-200/80 bg-white/70 backdrop-blur-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1.5">
          <h3 className="text-base font-serif-display font-bold text-stone-900">
            Vitrine Quilter Empreendedora 2026
          </h3>
          <p className="text-xs text-stone-500 max-w-md">
            Espaço oficial de divulgação do artesanato autoral e celebração das quilters empreendedoras. Negociação direta e segura via WhatsApp.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-stone-500">
          <div className="flex items-center space-x-1">
            <span>Feito com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para impulsionar a arte têxtil brasileira</span>
          </div>

          <span className="hidden sm:inline text-stone-300">•</span>

          <span className="text-stone-400">
            © 2026 Desafio Quilter Empreendedora
          </span>
        </div>
      </div>
    </footer>
  );
};
