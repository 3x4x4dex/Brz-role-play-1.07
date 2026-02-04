
import React from 'react';
import { TrendingUp, Wallet, Landmark, Crown, ShieldCheck } from 'lucide-react';
import { ClientData } from '../types';

interface RichCardProps {
  client: ClientData;
  rank: number;
}

export const RichCard: React.FC<RichCardProps> = ({ client, rank }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isTopThree = rank <= 3;
  const getRankColor = () => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-slate-200 to-slate-400';
    if (rank === 3) return 'from-amber-500 to-amber-700';
    return 'from-slate-700 to-slate-800';
  };

  const getBorderColor = () => {
    if (rank === 1) return 'border-yellow-500/30';
    if (rank === 2) return 'border-slate-400/20';
    if (rank === 3) return 'border-amber-600/20';
    return 'border-white/10';
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border ${getBorderColor()} bg-white/[0.03] p-8 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.06] group`}>
      {isTopThree && (
        <div className={`absolute -right-12 -top-12 bg-gradient-to-br ${getRankColor()} p-24 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity`} />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getRankColor()} font-black text-white shadow-2xl`}>
            {rank === 1 ? <Crown size={24} /> : rank}
          </div>
          {rank === 1 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Mogul</span>
            </div>
          )}
        </div>

        <div className="mb-10">
          <h3 className="text-2xl font-black tracking-tighter text-white uppercase truncate mb-1">
            {client.user || "Desconhecido"}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
            <ShieldCheck size={12} />
            {client.job || 'Patrimônio Auditado'}
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Saldo Bancário (Rus)</span>
            <span className="font-mono text-sm font-semibold text-slate-300">
              {formatCurrency(client.rus || 0)}
            </span>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fortuna Total</span>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div className={`text-3xl font-black tracking-tighter ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
              {formatCurrency(client.total_wealth)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
