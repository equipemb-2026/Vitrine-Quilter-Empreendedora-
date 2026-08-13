import React from 'react';
import { Sparkles } from 'lucide-react';

interface MasterBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MasterBadge: React.FC<MasterBadgeProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  };

  return (
    <span
      id="badge-master-quilter"
      className={`inline-flex items-center rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs backdrop-blur-xs font-sans tracking-tight ${sizeClasses[size]} ${className}`}
      title="Aluna Master Quilter Confirmada"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
      <span>Master Quilter</span>
    </span>
  );
};
