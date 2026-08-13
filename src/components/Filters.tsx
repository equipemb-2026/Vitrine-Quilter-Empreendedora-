import React from 'react';
import { Filter, Sparkles, Check, RotateCcw, ArrowUpDown } from 'lucide-react';
import { FilterState, StatusFilterOption } from '../types.ts';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  courseOptions: string[];
  stateOptions: string[];
  totalResults: number;
  hasActiveFilters: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  courseOptions,
  stateOptions,
  totalResults,
  hasActiveFilters,
}) => {
  const statusTabs: { id: StatusFilterOption; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'Todas as peças' },
    { id: 'available', label: 'Disponíveis para compra' },
    { id: 'master', label: 'Master Quilter', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400/30 mr-1" /> },
  ];

  return (
    <div id="filters-container" className="space-y-4">
      {/* Abas Rápidas de Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl">
          {statusTabs.map((tab) => {
            const isActive = filters.statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-filter-${tab.id}`}
                onClick={() => onFilterChange({ statusFilter: tab.id })}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contador de Resultados e Botão de Limpar */}
        <div className="flex items-center space-x-3 text-xs text-stone-500">
          <span>
            <strong className="text-stone-800 font-semibold">{totalResults}</strong> {totalResults === 1 ? 'peça encontrada' : 'peças encontradas'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="inline-flex items-center space-x-1 text-rose-700 hover:text-rose-900 font-medium transition-colors bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Secundários: Cursos, Estados e Ordenação */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Dropdown de Cursos */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <label htmlFor="course-select" className="sr-only">Filtrar por curso</label>
          <select
            id="course-select"
            value={filters.selectedCourse || ''}
            onChange={(e) => onFilterChange({ selectedCourse: e.target.value || null })}
            className="w-full text-xs sm:text-sm bg-white border border-stone-200/90 text-stone-700 py-2.5 px-3.5 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          >
            <option value="">Todos os cursos e comunidades</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Estado */}
        {stateOptions.length > 1 && (
          <div className="relative min-w-[140px]">
            <label htmlFor="state-select" className="sr-only">Filtrar por estado</label>
            <select
              id="state-select"
              value={filters.selectedState || ''}
              onChange={(e) => onFilterChange({ selectedState: e.target.value || null })}
              className="w-full text-xs sm:text-sm bg-white border border-stone-200/90 text-stone-700 py-2.5 px-3.5 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
            >
              <option value="">Todos os estados</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dropdown de Ordenação */}
        <div className="relative min-w-[160px] ml-auto">
          <label htmlFor="sort-select" className="sr-only">Ordenar peças</label>
          <div className="relative flex items-center">
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="w-full text-xs sm:text-sm bg-white border border-stone-200/90 text-stone-700 py-2.5 pl-3.5 pr-8 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
            >
              <option value="featured">Destaques da Edição</option>
              <option value="price-asc">Menor valor</option>
              <option value="price-desc">Maior valor</option>
              <option value="name-asc">Nome da autora (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
