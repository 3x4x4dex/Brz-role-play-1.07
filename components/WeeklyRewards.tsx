
import React from 'react';
import { Crown, Medal, Award, Sparkles } from 'lucide-react';

export const WeeklyRewards: React.FC = () => {
  return (
    <div className="mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="mb-10">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
          Podium de <span className="text-orange-500">Premiações</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
          <Sparkles size={12} className="text-orange-500" />
          Valores reais pagos via PIX aos top players
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOP 1 - MAGNATA (OURO) */}
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.05] to-transparent p-10 flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:bg-yellow-500/[0.08] shadow-2xl shadow-yellow-500/5">
          <div className="absolute -right-8 -top-8 text-yellow-500 opacity-5 group-hover:opacity-10 transition-opacity">
             <Crown size={180} />
          </div>
          
          <div className="h-24 w-24 rounded-full border-2 border-yellow-500/30 flex items-center justify-center mb-8 bg-yellow-500/10 shadow-inner">
             <Crown className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" size={48} />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Top 1 Magnata</p>
          <h3 className="text-5xl font-black text-white italic tracking-tighter mb-8">
             <span className="text-2xl not-italic mr-1">R$</span>25,00
          </h3>

          <div className="px-6 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10">
             <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Premiação Ouro</span>
          </div>
        </div>

        {/* TOP 2 - BARÃO (PRATA) */}
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-slate-400/20 bg-gradient-to-br from-slate-400/[0.05] to-transparent p-10 flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:bg-slate-400/[0.08] shadow-2xl shadow-slate-500/5">
          <div className="absolute -right-8 -top-8 text-slate-400 opacity-5 group-hover:opacity-10 transition-opacity">
             <Medal size={180} />
          </div>

          <div className="h-24 w-24 rounded-full border-2 border-slate-400/30 flex items-center justify-center mb-8 bg-slate-400/10 shadow-inner">
             <Medal className="text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.5)]" size={48} />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Top 2 Barão</p>
          <h3 className="text-5xl font-black text-white italic tracking-tighter mb-8">
             <span className="text-2xl not-italic mr-1">R$</span>15,00
          </h3>

          <div className="px-6 py-2 rounded-full border border-slate-400/20 bg-slate-400/10">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Premiação Prata</span>
          </div>
        </div>

        {/* TOP 3 - ELITE (BRONZE) */}
        <div className="relative group overflow-hidden rounded-[2.5rem] border border-orange-700/20 bg-gradient-to-br from-orange-700/[0.05] to-transparent p-10 flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:bg-orange-700/[0.08] shadow-2xl shadow-orange-900/5">
          <div className="absolute -right-8 -top-8 text-orange-700 opacity-5 group-hover:opacity-10 transition-opacity">
             <Award size={180} />
          </div>

          <div className="h-24 w-24 rounded-full border-2 border-orange-700/30 flex items-center justify-center mb-8 bg-orange-700/10 shadow-inner">
             <Award className="text-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]" size={48} />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Top 3 Elite</p>
          <h3 className="text-5xl font-black text-white italic tracking-tighter mb-8">
             <span className="text-2xl not-italic mr-1">R$</span>10,00
          </h3>

          <div className="px-6 py-2 rounded-full border border-orange-700/20 bg-orange-700/10">
             <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Premiação Bronze</span>
          </div>
        </div>
      </div>
    </div>
  );
};
