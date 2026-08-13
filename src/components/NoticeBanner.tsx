import React from 'react';
import { Sparkles, MessageCircle, HeartHandshake, ShieldCheck } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div
      id="notice-banner"
      className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
    >
      {/* Detalhes sutis decorativos */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -top-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-stone-800/90 border border-stone-700 flex items-center justify-center shrink-0 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Artesanato Autoral</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Obras exclusivas e de alto padrão produzidas por quilters de todo o Brasil.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-stone-800/90 border border-stone-700 flex items-center justify-center shrink-0 text-emerald-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contato Direto no WhatsApp</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Negociação de pagamento e envio combinada diretamente com a artesã, sem intermediários.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-stone-800/90 border border-stone-700 flex items-center justify-center shrink-0 text-rose-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">100% para a Criadora</h4>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
              Valor integral destinado à artesã, impulsionando o empreendedorismo feminino artesanal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
