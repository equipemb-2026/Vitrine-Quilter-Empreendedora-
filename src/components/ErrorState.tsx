import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ocorreu um erro ao carregar as peças da vitrine.',
  onRetry,
  isRetrying = false,
}) => {
  const displayMessage = React.useMemo(() => {
    if (!message) return 'Ocorreu um erro ao carregar as peças da vitrine.';
    if (typeof message === 'string') return message;
    if (typeof message === 'object') {
      try {
        const obj = message as Record<string, any>;
        return obj.error || obj.message || JSON.stringify(message);
      } catch {
        return 'Erro inesperado na comunicação com a vitrine.';
      }
    }
    return String(message);
  }, [message]);

  return (
    <div
      id="error-state"
      className="py-16 px-6 text-center bg-white rounded-3xl border border-rose-200/80 shadow-xs max-w-xl mx-auto flex flex-col items-center justify-center space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-serif-display font-semibold text-stone-900">
          Não foi possível exibir a vitrine
        </h3>
        <p className="text-sm text-stone-600 max-w-md">
          {displayMessage}
        </p>
      </div>

      <button
        type="button"
        id="btn-retry-load"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}</span>
      </button>
    </div>
  );
};
