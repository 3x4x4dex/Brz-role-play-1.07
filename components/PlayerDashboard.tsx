
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Coins, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  CircleDollarSign,
  ShoppingBag,
  ExternalLink,
  Package,
  TrendingUp,
  History,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ClientData, WithdrawRequest, AuthUser, SiteUser, ShopItem, PurchaseRequest } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

interface PlayerDashboardProps {
  user: AuthUser;
  stats: ClientData | null;
  history: WithdrawRequest[];
  siteUser: SiteUser | null;
  onRefresh: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ user, stats, history, siteUser, onRefresh }) => {
  const [tab, setTab] = useState<'dashboard' | 'shop'>('dashboard');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  const fetchData = async () => {
    const { data: sItems } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    setShopItems(sItems || []);
  };

  useEffect(() => {
    fetchData();
  }, [siteUser]);

  // Sincronização definitiva com o banco
  const approvedWithdraws = useMemo(() => history.filter(h => h.status === 'approved'), [history]);
  const pendingCount = useMemo(() => history.filter(h => h.status === 'pending').length, [history]);
  const finishedCount = useMemo(() => history.filter(h => h.status === 'approved' || h.status === 'denied').length, [history]);

  // Totais calculados a partir das transações reais no banco
  const totalApprovedCoins = useMemo(() => 
    history.filter(h => h.currency_type === 'coin' && h.status === 'approved')
           .reduce((a, b) => a + Number(b.amount), 0), 
  [history]);

  const totalApprovedRus = useMemo(() => 
    history.filter(h => h.currency_type === 'rus' && h.status === 'approved')
           .reduce((a, b) => a + Number(b.amount), 0), 
  [history]);

  // Dados do gráfico mapeando o histórico bancário real
  const generateChartData = (currency: 'coin' | 'rus') => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(date => {
      const dayTotal = history
        .filter(h => h.currency_type === currency && h.status === 'approved' && h.created_at?.startsWith(date))
        .reduce((sum, h) => sum + Number(h.amount), 0);
      
      const [year, month, day] = date.split('-');
      return { 
        name: `${day}/${month}`,
        value: dayTotal
      };
    });
  };

  const coinPerformance = useMemo(() => generateChartData('coin'), [history]);
  const rusPerformance = useMemo(() => generateChartData('rus'), [history]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUser) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > (siteUser.coins || 0)) return alert('Saldo insuficiente ou valor inválido.');
    
    setLoading(true);
    try {
      const { error } = await supabase.from('withdraw_requests').insert([{
        user: user.mta_login, // Corrigido para coluna 'user'
        amount,
        pix_key: pixKey,
        currency_type: 'coin',
        status: 'pending'
      }]);
      if (error) throw error;
      await supabase.from('site_users').update({ coins: (siteUser.coins || 0) - amount }).eq('id', siteUser.id);
      alert('Solicitação enviada para auditoria!');
      setWithdrawAmount('');
      setPixKey('');
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex gap-2 p-1.5 bg-[#0e0e11] border border-white/5 rounded-2xl w-fit mx-auto shadow-2xl">
        <button 
          onClick={() => setTab('dashboard')} 
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${tab === 'dashboard' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'text-slate-500 hover:text-white'}`}
        >
          <Activity size={14}/> Performance
        </button>
        <button 
          onClick={() => setTab('shop')} 
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${tab === 'shop' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-white'}`}
        >
          <ShoppingBag size={14}/> Loja RP
        </button>
      </div>

      {tab === 'dashboard' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    <span className="text-[9px] font-black text-yellow-500/70 uppercase tracking-[0.3em]">Asset: Coins Portal</span>
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recebíveis <span className="text-yellow-500">Coins</span></h3>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Acumulado (Coins)</p>
                  <p className="text-3xl font-black text-white italic tracking-tighter">
                    R$ {totalApprovedCoins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coinPerformance}>
                    <defs>
                      <linearGradient id="colorCoin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#475569', fontSize: 9, fontWeight: 700}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{backgroundColor:'#0e0e11', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', fontSize: '10px'}}
                      itemStyle={{color: '#fbbf24'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorCoin)" animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-[9px] font-black text-[#10b981]/70 uppercase tracking-[0.3em]">Asset: Rus In-Game</span>
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recebíveis <span className="text-[#10b981]">Rus</span></h3>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Acumulado (Rus)</p>
                  <p className="text-3xl font-black text-white italic tracking-tighter">
                    R$ {totalApprovedRus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rusPerformance}>
                    <defs>
                      <linearGradient id="colorRus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#475569', fontSize: 9, fontWeight: 700}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{backgroundColor:'#0e0e11', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', fontSize: '10px'}}
                      itemStyle={{color: '#10b981'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRus)" animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0e0e11] border border-white/5 p-8 rounded-[1.5rem] flex items-center justify-between group hover:border-[#10b981]/20 transition-all">
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Saldo Bancário Rus</p>
                  <h4 className="text-2xl font-black text-white italic tracking-tighter">R$ {stats?.rus?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</h4>
               </div>
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Database size={18} className="text-slate-600" />
               </div>
            </div>
            <div className="bg-[#0e0e11] border border-yellow-500/10 p-8 rounded-[1.5rem] flex items-center justify-between group hover:border-yellow-500/30 transition-all">
               <div>
                  <p className="text-[9px] font-black text-yellow-500/60 uppercase mb-2 tracking-widest">Saldo Portal Coins</p>
                  <h4 className="text-2xl font-black text-white italic tracking-tighter">R$ {siteUser?.coins?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</h4>
               </div>
               <div className="h-10 w-10 rounded-xl bg-yellow-500/5 flex items-center justify-center">
                  <Coins size={18} className="text-yellow-500/40" />
               </div>
            </div>
            <div className="bg-[#0e0e11] border border-white/5 p-8 rounded-[1.5rem] flex items-center justify-between group hover:border-amber-500/20 transition-all">
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Aguardando Auditoria</p>
                  <h4 className="text-2xl font-black text-white italic tracking-tighter">{pendingCount}</h4>
               </div>
               <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock size={18} className="text-slate-600" />
               </div>
            </div>
            <div className="bg-[#0e0e11] border border-white/5 p-8 rounded-[1.5rem] flex items-center justify-between group hover:border-[#10b981]/30 transition-all">
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Saques Finalizados</p>
                  <h4 className="text-2xl font-black text-white italic tracking-tighter">{finishedCount}</h4>
               </div>
               <div className="h-10 w-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-[#10b981]/40" />
               </div>
            </div>
          </div>

          <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <div className="px-10 py-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.01]">
                <Activity size={18} className="text-[#10b981]" />
                <h4 className="text-[11px] font-black text-white uppercase italic tracking-[0.2em]">Consolidado de Movimentações</h4>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest">
                 <thead className="bg-white/[0.02] text-slate-600">
                   <tr>
                     <th className="px-10 py-6 border-b border-white/5">Data</th>
                     <th className="px-10 py-6 border-b border-white/5">Tipo</th>
                     <th className="px-10 py-6 border-b border-white/5">Status</th>
                     <th className="px-10 py-6 border-b border-white/5 text-right">Montante</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {history.length === 0 ? (
                     <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-800 italic font-black uppercase tracking-[0.3em]">Sem registros de movimentação encontrados</td></tr>
                   ) : (
                     history.map(h => (
                       <tr key={h.id} className="hover:bg-white/[0.01] transition-colors group">
                         <td className="px-10 py-6 text-slate-500 font-mono">{new Date(h.created_at).toLocaleDateString('pt-BR')}</td>
                         <td className="px-10 py-6 text-white uppercase">{h.currency_type === 'coin' ? 'Coin Portal' : 'Rus In-Game'}</td>
                         <td className="px-10 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${h.status === 'approved' ? 'bg-[#10b981]/10 text-[#10b981]' : h.status === 'denied' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                             {h.status}
                           </span>
                         </td>
                         <td className="px-10 py-6 text-right text-white font-black italic text-sm">
                           R$ {h.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-[#0e0e11] border border-yellow-500/10 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-5 mb-10">
                   <div className="h-12 w-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                      <Wallet className="text-yellow-500" size={24} />
                   </div>
                   <div>
                      <h4 className="text-base font-black text-white uppercase italic tracking-widest">Resgatar Saldo em Coins</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sincronizado via MTA x Supabase x Real-time</p>
                   </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Valor do Resgate (Coins)</label>
                         <input 
                           type="number" 
                           value={withdrawAmount} 
                           onChange={e=>setWithdrawAmount(e.target.value)} 
                           className="w-full bg-black/60 border border-white/5 h-16 rounded-2xl px-8 text-2xl font-black text-white outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-900" 
                           placeholder="0.00" 
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Chave PIX do Magnata</label>
                         <input 
                           type="text" 
                           value={pixKey} 
                           onChange={e=>setPixKey(e.target.value)} 
                           className="w-full bg-black/60 border border-white/5 h-16 rounded-2xl px-8 text-[11px] font-bold text-white outline-none focus:border-yellow-500/40 transition-all placeholder:text-slate-900" 
                           placeholder="CPF / E-mail / Celular" 
                         />
                      </div>
                   </div>
                   <button 
                     disabled={loading || !withdrawAmount || !pixKey} 
                     className="w-full h-16 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl shadow-yellow-600/20 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30"
                   >
                     {loading ? <Loader2 className="animate-spin" size={20} /> : (
                       <><CircleDollarSign size={20}/> Confirmar Resgate Pix</>
                     )}
                   </button>
                </form>
             </div>

             <div className="bg-[#0e0e11] border border-[#10b981]/10 rounded-[2.5rem] p-12 flex flex-col justify-center shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <ShieldCheck size={200} className="text-[#10b981]" />
                </div>
                <div className="h-16 w-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mb-10 border border-[#10b981]/20 shadow-lg shadow-[#10b981]/10">
                   <ShieldCheck className="text-[#10b981]" size={36} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-6 italic">Integridade de Dados</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest">
                   Todas as solicitações passam por auditoria automática de conformidade. O fluxo de Rus é monitorado em tempo real para garantir a estabilidade econômica da BRz RP.
                </p>
                <div className="mt-10 pt-10 border-t border-white/5 flex items-center gap-3 text-[9px] font-black text-[#10b981] uppercase tracking-widest cursor-pointer hover:gap-4 transition-all">
                   Protocolos de Segurança <ChevronRight size={14} />
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {shopItems.map(item => (
            <div key={item.id} className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-purple-500/40 transition-all group">
               <div className="h-64 bg-black/40 flex items-center justify-center relative overflow-hidden">
                 {item.image_url ? (
                   <img src={item.image_url} className="w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-70 transition-all duration-1000" />
                 ) : (
                   <Package size={64} className="text-slate-800"/>
                 )}
                 <div className="absolute top-6 right-6 px-5 py-2.5 bg-black/80 backdrop-blur-xl rounded-2xl text-[#10b981] font-black italic text-xs border border-white/10 shadow-2xl">
                   R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </div>
               </div>
               <div className="p-10 text-center">
                 <h4 className="text-base font-black text-white uppercase italic mb-8 tracking-tighter">{item.name}</h4>
                 <button 
                   onClick={() => {
                     window.open(item.redirect_url, '_blank');
                   }} 
                   className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                   Adquirir Agora <ArrowUpRight size={16}/>
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
