
import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Loader2, UserPlus, Fingerprint, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AuthUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mtaLogin, setMtaLogin] = useState('');
  const [mtaSerial, setMtaSerial] = useState('');

  if (!isOpen) return null;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        // Primeiro tenta login como Admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (adminData) {
          onLoginSuccess({ email: adminData.email, role: 'admin' });
          onClose();
          return;
        }

        // Se não for admin, tenta login como usuário do site
        const { data: userData } = await supabase
          .from('site_users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (!userData) throw new Error("Credenciais inválidas.");
        if (userData.status === 'pending') throw new Error("Sua conta está aguardando aprovação administrativa.");
        if (userData.status === 'denied') throw new Error("Seu acesso foi negado pela administração.");

        onLoginSuccess({ 
          id: userData.id,
          email: userData.email, 
          role: 'player', 
          mta_login: userData.mta_login,
          status: userData.status 
        });
        onClose();

      } else {
        // Registro
        if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
        
        const { error: regError } = await supabase
          .from('site_users')
          .insert([{
            email,
            password,
            mta_login: mtaLogin,
            mta_serial: mtaSerial,
            status: 'pending'
          }]);

        if (regError) throw regError;
        setSuccess("Registro enviado! Aguarde a aprovação de um administrador.");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#0e0e10] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="absolute top-0 right-0 p-6">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            {mode === 'login' ? <Lock className="text-emerald-500" size={32} /> : <UserPlus className="text-emerald-500" size={32} />}
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {mode === 'login' ? 'Acesso' : 'Cadastro'} <span className="text-emerald-500">MTA</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Plataforma Oficial BRz Roleplay</p>
        </div>

        <form onSubmit={handleAction} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Login MTA</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" value={mtaLogin} onChange={(e) => setMtaLogin(e.target.value)} required className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:border-emerald-500/50 transition-all" placeholder="mta_login" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Serial MTA</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" value={mtaSerial} onChange={(e) => setMtaSerial(e.target.value)} required className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:border-emerald-500/50 transition-all" placeholder="Serial" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:border-emerald-500/50 transition-all" placeholder="admin@brz.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:border-emerald-500/50 transition-all" placeholder="••••••••" />
                </div>
              </div>
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:border-emerald-500/50 transition-all" placeholder="••••••••" />
                  </div>
                </div>
              )}
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold flex items-center gap-2"><ShieldAlert size={14} />{error}</div>}
          {success && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">{success}</div>}

          <button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-3 mt-4">
            {loading ? <Loader2 className="animate-spin" size={20} /> : mode === 'login' ? 'Acessar Conta' : 'Enviar Cadastro'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors uppercase tracking-widest"
          >
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já possui conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
