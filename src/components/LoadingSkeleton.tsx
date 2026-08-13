import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div id="loading-skeletons" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs flex flex-col animate-pulse"
        >
          {/* Imagem Skeleton */}
          <div className="aspect-4/3 bg-stone-200/70 w-full" />

          {/* Conteúdo Skeleton */}
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-3.5 bg-stone-200/80 rounded-md w-1/3" />
              <div className="h-5 bg-stone-200 rounded-md w-3/4" />
              <div className="space-y-1.5 pt-2">
                <div className="h-3 bg-stone-100 rounded-md w-full" />
                <div className="h-3 bg-stone-100 rounded-md w-5/6" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-stone-200/60 rounded-md w-1/4" />
                <div className="h-6 bg-stone-200 rounded-md w-1/3" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 bg-stone-200/70 rounded-xl" />
                <div className="h-9 bg-stone-200/70 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
