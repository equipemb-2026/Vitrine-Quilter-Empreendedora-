import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="search-input" className="sr-only">
        Buscar por peça ou autora
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-4.5 pointer-events-none text-stone-400">
          <Search className="w-4.5 h-4.5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por peça ou autora..."
          className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl border border-stone-200/90 text-stone-900 placeholder:text-stone-400 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all duration-200"
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            id="btn-clear-search"
            onClick={onClear}
            className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
