import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasActiveFilters, onResetFilters }) => {
  return (
    <div
      id="empty-state"
      className="py-16 px-6 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-xl mx-auto flex flex-col items-center justify-center space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-serif-display font-semibold text-stone-900">
          Nenhuma peça encontrada
        </h3>
        <p className="text-sm text-stone-500 max-w-md">
          {hasActiveFilters
            ? 'Não encontramos peças com a combinação de filtros ou busca selecionada. Tente ajustar os termos ou redefinir os filtros.'
            : 'No momento ainda não há peças aprovadas e publicadas na vitrine. Em breve novas criações estarão disponíveis.'}
        </p>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          id="btn-empty-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ver todas as peças</span>
        </button>
      )}
    </div>
  );
};
