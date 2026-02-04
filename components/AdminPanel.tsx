
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  X, 
  Users, 
  Coins, 
  ShoppingBag,
  Trash2,
  Save,
  Settings,
  Database,
  Eye,
  CreditCard,
  Plus,
  Copy,
  CheckCheck
} from 'lucide-react';
import { WithdrawRequest, SiteUser, ShopItem, PurchaseRequest } from '../types';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  requests: WithdrawRequest[];
  onUpdate: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ requests, onUpdate }) => {
  const [tab, setTab] = useState<'withdraws_coin' | 'withdraws_rus' | 'users' | 'members' | 'shop' | 'sales'>('withdraws_coin');
  const [pendingUsers, setPendingUsers] = useState<SiteUser[]>([]);
  const [allUsers, setAllUsers] = useState<SiteUser[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [selectedUserForCoins, setSelectedUserForCoins] = useState<SiteUser | null>(null);
  const [coinAmountToSet, setCoinAmountToSet] = useState('');
  const [newItem, setNewItem] = useState<Partial<ShopItem>>({ name: '', price: 0, image_url: '', redirect_url: '', category: 'coin', value: 0 });

  const handleCopyPix = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchDataForTab = useCallback(async () => {
    try {
      if (tab === 'members') {
        const { data } = await supabase.from('site_users').select('*').eq('status', 'pending');
        setPendingUsers(data || []);
      } else if (tab === 'users') {
        const { data } = await supabase.from('site_users').select('*').order('mta_login');
        setAllUsers(data || []);
      } else if (tab === 'shop') {
        const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
        setShopItems(data || []);
      } else if (tab === 'sales') {
        const { data } = await supabase.from('purchase_requests').select('*').eq('status', 'pending');
        setPurchaseRequests(data || []);
      } else {
        onUpdate();
      }
    } catch (e) { console.error("Tab Fetch Error", e); }
  }, [tab, onUpdate]);

  useEffect(() => {
    fetchDataForTab();
  }, [tab]);

  const filteredUsers = allUsers.filter(u => u.mta_login?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Master <span className="text-emerald-500">Command</span></h2>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-2">Administração Estratégica BRz RP</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        {[
          { id: 'withdraws_coin', icon: CreditCard, label: 'Saques Coin' },
          { id: 'withdraws_rus', icon: Database, label: 'Saques Rus' },
          { id: 'sales', icon: ShoppingBag, label: 'Vendas' },
          { id: 'users', icon: Coins, label: 'Carteiras' },
          { id: 'shop', icon: Settings, label: 'Catálogo' },
          { id: 'members', icon: Users, label: 'Acessos' }
        ].map(btn => (
          <button 
            key={btn.id}
            onClick={() => setTab(btn.id as any)} 
            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === btn.id ? 'bg-white/10 text-white shadow-xl' : 'text-slate-600 hover:text-white'}`}
          >
            <btn.icon size={14}/> {btn.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0e0e11] border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[450px] shadow-2xl">
        {tab === 'users' ? (
          <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <input type="text" placeholder="Filtrar Magnata..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none" />
              <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">
                {filteredUsers.map(u => (
                  <div key={u.id} onClick={() => setSelectedUserForCoins(u)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedUserForCoins?.id === u.id ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/5 border-white/5'}`}>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase">{u.mta_login}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Portal Coins: <span className="text-yellow-500">R$ {u.coins?.toLocaleString()}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedUserForCoins && (
              <div className="bg-yellow-500/[0.02] p-8 rounded-[2rem] border border-yellow-500/10 flex flex-col justify-between">
                <div>
                   <h4 className="text-[10px] font-black text-yellow-500 uppercase mb-6">Ajustar Saldo</h4>
                   <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-6">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Magnata</p>
                      <p className="text-xl font-black text-white italic uppercase">{selectedUserForCoins.mta_login}</p>
                   </div>
                   <input type="number" value={coinAmountToSet} onChange={e => setCoinAmountToSet(e.target.value)} className="w-full h-16 bg-black/60 border border-white/10 rounded-2xl px-8 text-2xl font-black text-white outline-none mb-4" placeholder="0.00" />
                   <button onClick={async () => {
                     await supabase.from('site_users').update({ coins: Number(coinAmountToSet) }).eq('id', selectedUserForCoins.id);
                     alert("Saldo Atualizado!"); fetchDataForTab(); setCoinAmountToSet('');
                   }} className="w-full h-16 bg-yellow-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all"><Save className="inline mr-2" size={16}/> Salvar</button>
                </div>
              </div>
            ) : <div className="h-full flex flex-col items-center justify-center opacity-10"><Coins size={64}/><p className="text-[10px] mt-4 font-black uppercase">Selecione um Magnata</p></div>}
          </div>
        ) : tab === 'shop' ? (
           <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase text-purple-500 tracking-widest">Novo Item</h4>
                 <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white" placeholder="Nome" />
                 <input type="number" placeholder="Preço" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white" />
                 <input placeholder="Checkout Link" value={newItem.redirect_url} onChange={e => setNewItem({...newItem, redirect_url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white" />
                 <button onClick={async () => { await supabase.from('shop_items').insert([newItem]); fetchDataForTab(); setNewItem({name:'',price:0,image_url:'',redirect_url:'',category:'coin',value:0}); }} className="w-full bg-purple-600 p-4 rounded-xl text-xs font-black uppercase tracking-widest">Publicar</button>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                 {shopItems.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[11px] font-black text-white uppercase italic">{item.name}</p>
                     <button onClick={async () => { if(confirm("Remover?")) { await supabase.from('shop_items').delete().eq('id', item.id); fetchDataForTab(); } }} className="text-red-500/50 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                 ))}
              </div>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest">
              <thead className="bg-white/5 text-slate-500 border-b border-white/5">
                <tr><th className="px-10 py-6">Entidade</th><th className="px-10 py-6">Detalhes</th><th className="px-10 py-6 text-right">Ação</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(tab.includes('withdraws') ? requests.filter(r => r.currency_type === (tab === 'withdraws_coin' ? 'coin' : 'rus')) : purchaseRequests).map(req => {
                  // Determina o nome para exibição baseado no tipo de requisição (user para saques, mta_login para compras)
                  const displayName = (req as any).user || (req as any).mta_login || "N/A";
                  
                  return (
                    <tr key={req.id} className="hover:bg-white/[0.02]">
                      <td className="px-10 py-6">
                         <div className="flex flex-col">
                            <span className="text-white text-xs font-black tracking-tighter uppercase">{displayName}</span>
                            <span className="text-[9px] text-slate-600 font-bold">{new Date(req.created_at).toLocaleDateString()}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`text-xs font-black italic tracking-tighter ${tab === 'sales' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                            {tab === 'sales' ? (req as any).item_name : `R$ ${req.amount.toLocaleString()}`}
                          </span>
                          {req.pix_key && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{req.pix_key}</span>
                              <button 
                                onClick={() => handleCopyPix(req.id, req.pix_key)}
                                className={`p-1.5 rounded-lg transition-all ${copiedId === req.id ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                title="Copiar PIX"
                              >
                                {copiedId === req.id ? <CheckCheck size={12}/> : <Copy size={12}/>}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right flex justify-end gap-3">
                        <button onClick={async () => {
                          const table = tab === 'sales' ? 'purchase_requests' : 'withdraw_requests';
                          await supabase.from(table).update({status:'denied'}).eq('id', req.id);
                          fetchDataForTab();
                        }} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><X size={16}/></button>
                        
                        <button onClick={async () => {
                          const table = tab === 'sales' ? 'purchase_requests' : 'withdraw_requests';
                          await supabase.from(table).update({status:'approved'}).eq('id', req.id);
                          fetchDataForTab();
                        }} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600">Aprovar</button>
                      </td>
                    </tr>
                  );
                })}
                {(!requests.length && !purchaseRequests.length) && (
                   <tr><td colSpan={3} className="px-10 py-24 text-center text-slate-800 text-xs font-black uppercase italic">Sem pendências</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
