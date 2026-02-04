
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { ClientData, EconomicReport, WithdrawRequest, AuthUser, SiteUser } from './types';
import { RichCard } from './components/RichCard';
import { StatsPanel } from './components/StatsPanel';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { PlayerDashboard } from './components/PlayerDashboard';
import { WeeklyRewards } from './components/WeeklyRewards';
import { generateEconomicReport } from './services/geminiService';
import { 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  LogOut,
  Lock,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'forbes' | 'admin' | 'player_dashboard'>('forbes');
  const [loading, setLoading] = useState(true);
  const [initialSync, setInitialSync] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [report, setReport] = useState<EconomicReport | null>(null);
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [playerHistory, setPlayerHistory] = useState<WithdrawRequest[]>([]);
  const [siteUser, setSiteUser] = useState<SiteUser | null>(null);
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('brz_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const playerStats = useMemo(() => {
    if (!user || !user.mta_login) return null;
    return clients.find(c => c.user === user.mta_login);
  }, [user, clients]);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data: bankData, error: sbError } = await supabase.from('bank_clients').select('*');
      if (sbError) throw sbError;
      
      if (bankData) {
        const processed = bankData.map(item => ({
          ...item,
          total_wealth: Number(item.rus || 0),
          job: "Elite Bancária"
        })).sort((a, b) => b.total_wealth - a.total_wealth).slice(0, 20);
        setClients(processed);
        generateEconomicReport(processed).then(setReport).catch(() => {});
      }

      if (user) {
        if (user.role === 'admin') {
          const { data } = await supabase.from('withdraw_requests').select('*').eq('status', 'pending');
          setWithdraws(data || []);
        }
        
        // CORREÇÃO: Usando a coluna 'user' conforme imagem do Supabase
        if (user.mta_login) {
          const { data } = await supabase
            .from('withdraw_requests')
            .select('*')
            .eq('user', user.mta_login)
            .order('created_at', { ascending: false });
          setPlayerHistory(data || []);
        }

        if (user.role === 'player') {
          const { data } = await supabase.from('site_users').select('*').eq('email', user.email).single();
          setSiteUser(data);
        }
      }
      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(`Erro na conexão com o servidor.`);
    } finally {
      setLoading(false);
      setInitialSync(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAdminView = () => {
    if (user?.role === 'admin') setView(v => v === 'admin' ? 'forbes' : 'admin');
  };

  const togglePlayerView = () => {
    if (!user) { setIsLoginModalOpen(true); return; }
    setView(v => v === 'player_dashboard' ? 'forbes' : 'player_dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0b]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('forbes')}>
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <UserCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase italic leading-tight">BRz RP <span className="text-emerald-500">FORBES</span></h1>
              <p className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Network Authority</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button onClick={togglePlayerView} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'player_dashboard' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>Meu Portal</button>
                {user.role === 'admin' && (
                  <button onClick={toggleAdminView} className={`p-2 rounded-xl border transition-all ${view === 'admin' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'}`}><Settings size={18} /></button>
                )}
                <button onClick={() => { setUser(null); localStorage.removeItem('brz_auth'); setView('forbes'); }} className="p-2 text-slate-600 hover:text-red-500"><LogOut size={18}/></button>
              </>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-500"><Lock size={14} className="inline mr-2"/> Entrar</button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        {initialSync && loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 size={64} className="animate-spin text-emerald-500 opacity-20" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando...</p>
          </div>
        ) : error ? (
          <div className="p-12 border border-red-500/10 rounded-[3rem] text-center">
             <ShieldAlert size={48} className="mx-auto text-red-500/30 mb-6" />
             <p className="text-slate-400 font-bold mb-6">{error}</p>
             <button onClick={() => fetchData()} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase">Reconectar</button>
          </div>
        ) : view === 'forbes' ? (
          <>
            {report && (
              <div className="mb-20 rounded-[2.5rem] bg-[#0e0e11] border border-white/5 p-10 shadow-2xl">
                <p className="text-3xl font-light italic text-slate-100 leading-relaxed mb-10">"{report.summary}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-slate-500 mb-2 tracking-widest">Performance</p>
                    <p className="font-bold text-emerald-500 uppercase italic tracking-tighter">{report.topTrend}</p>
                  </div>
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-black text-slate-500 mb-2 tracking-widest">Concentração</p>
                    <p className="font-bold text-blue-500 uppercase italic tracking-tighter">{report.inequalityScore}</p>
                  </div>
                </div>
              </div>
            )}
            <WeeklyRewards />
            <div className="mb-12"><RichCard client={clients[0]} rank={1} /></div>
            <StatsPanel data={clients} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clients.slice(1).map((c, i) => <RichCard key={String(c.id)} client={c} rank={i + 2} />)}
            </div>
          </>
        ) : view === 'admin' ? (
          <AdminPanel requests={withdraws} onUpdate={() => fetchData(true)} />
        ) : (
          user && <PlayerDashboard user={user} stats={playerStats || null} history={playerHistory} siteUser={siteUser} onRefresh={() => fetchData(true)} />
        )}
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={(u) => { setUser(u); localStorage.setItem('brz_auth', JSON.stringify(u)); fetchData(); }} />
    </div>
  );
};

export default App;
