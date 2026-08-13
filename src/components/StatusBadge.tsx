import React from 'react';
import { PieceStatus } from '../types.ts';

interface StatusBadgeProps {
  status: PieceStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'Disponível':
      return (
        <span
          id="badge-status-disponivel"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Disponível
        </span>
      );

    case 'Reservada':
      return (
        <span
          id="badge-status-reservada"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
          Em negociação
        </span>
      );

    case 'Vendida':
      return (
        <span
          id="badge-status-vendida"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
          Vendida
        </span>
      );

    default:
      return null;
  }
};
