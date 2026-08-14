import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  totalPieces: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalPieces,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header id="app-header" className="relative pt-10 pb-8 sm:pt-14 sm:pb-12 text-center">
      {/* Decoração superior sutil */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-rose-100/80 text-rose-900 border border-rose-200/70 shadow-2xs">
          <Sparkles className="w-3 h-3 mr-1.5 text-rose-600 fill-rose-500/40" />
          Desafio Oficial 2026
        </span>
      </div>

      {/* Título Principal */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-display font-bold text-stone-900 tracking-tight leading-tight max-w-4xl mx-auto px-4">
        Vitrine Quilter Empreendedora 2026
      </h1>

      {/* Subtítulo Oficial */}
      <p className="mt-4 text-sm sm:text-base md:text-lg text-stone-600 max-w-2xl mx-auto px-4 font-normal leading-relaxed">
        Conheça as peças produzidas pelas participantes do Desafio Quilter Empreendedora 2026 e entre em contato diretamente com cada autora.
      </p>

      {/* Botão sutil de atualização */}
      <div className="mt-5 flex items-center justify-center space-x-3 text-xs text-stone-500">
        <button
          type="button"
          id="btn-header-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg border border-stone-200/80 transition-colors disabled:opacity-50"
          title="Atualizar lista de peças"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar vitrine'}</span>
        </button>
      </div>
    </header>
  );
};
