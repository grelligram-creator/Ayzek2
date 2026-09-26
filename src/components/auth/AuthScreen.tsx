import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Globe,
  Compass,
} from 'lucide-react';
import { AuthUser } from '../../types/ayzek';
import { api } from '../../services/api';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser, token: string, isNewUser?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(email, password);
        if (res.success && res.user && res.token) {
          onLoginSuccess(res.user, res.token, false);
        } else {
          setErrorMsg(res.message || 'Giriş yapılamadı.');
        }
      } else {
        const res = await api.register(email, password, name);
        if (res.success) {
          // Auto login after register
          const loginRes = await api.login(email, password);
          if (loginRes.success && loginRes.user && loginRes.token) {
            onLoginSuccess(loginRes.user, loginRes.token, true);
          }
        } else {
          setErrorMsg(res.message || 'Kayıt oluşturulamadı.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const email = provider === 'google' ? 'kullanici.google@ayzek.life' : 'kullanici.apple@ayzek.life';
      const name = provider === 'google' ? 'Google Kullanıcısı' : 'Apple Kullanıcısı';
      const res = await api.socialLogin(provider, email, name);
      if (res.success && res.user && res.token) {
        onLoginSuccess(res.user, res.token, res.isNewUser);
      } else {
        setErrorMsg(res.message || 'Sosyal giriş yapılamadı.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş sırasında hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-tap PoC profiles
  const handleQuickDemoLogin = async (demoType: 'gorkem' | 'zeynep' | 'fresh_user') => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (demoType === 'gorkem') {
        const res = await api.login('gorkem.elligram@grispi.com', 'ayzek2026password');
        if (res.success && res.user && res.token) {
          onLoginSuccess(res.user, res.token, false);
        }
      } else if (demoType === 'zeynep') {
        const res = await api.socialLogin('google', 'zeynep.mimar@studio.com', 'Zeynep Kaya');
        if (res.success && res.user && res.token) {
          onLoginSuccess(res.user, res.token, false);
        }
      } else {
        // Fresh user: trigger Fast Start pop-up
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const res = await api.socialLogin('apple', `yeni.kullanici.${randomId}@ayzek.life`, 'Yeni Kullanıcı');
        if (res.success && res.user && res.token) {
          onLoginSuccess(res.user, res.token, true); // isNewUser: true -> automatically opens Fast Start pop-up!
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Soft Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 bg-sky-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center">
        {/* Brand Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-950 p-[1px] shadow-[0_12px_32px_rgba(0,0,0,0.6)] mx-auto mb-3.5 flex items-center justify-center border border-white/15">
            <div className="w-full h-full rounded-[23px] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-tr from-white via-cyan-200 to-indigo-300">
              A
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            AYZEK
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-500/30">
              OS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Kişisel Yaşam İşletim Sistemi & Zihinsel Sırdaş
          </p>
        </div>

        {/* Glassmorphism Frosted Container */}
        <div className="w-full rounded-3xl bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-5 sm:p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] relative">
          {/* Specular Highlight Top Border */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

          {/* Social One-Tap Logins (Google & Apple) */}
          <div className="space-y-2.5 mb-5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(255,255,255,0.1)] active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.92H1.21v3.15C3.25 21.43 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.28c-.24-.72-.38-1.5-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.1 0 9.99 0 12s.44 3.9 1.21 5.43l4.11-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.57 1.21 6.57l4.11 3.15c.94-2.82 3.58-4.97 6.68-4.97z"
                />
              </svg>
              <span>Google ile Devam Et</span>
            </button>

            {/* Apple Sign In */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-950/90 hover:bg-slate-950 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.4)] active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.95.99-3.09-.96.04-2.12.65-2.8 1.45-.6.7-1.13 1.83-1 2.95 1.07.08 2.15-.57 2.81-1.31z" />
              </svg>
              <span>Apple ile Giriş Yap</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              veya e-posta
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Tabs: Login / Register */}
          <div className="flex rounded-xl bg-slate-950/70 p-1 mb-4 border border-white/10">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yeni Hesap
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Adınız ve Soyadınız
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Görkem Kaya"
                    className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adiniz@sirket.com"
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-500/30">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{tab === 'login' ? 'Giriş Yap' : 'Hesabımı Oluştur'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Tap Fast PoC Testing Accounts */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-semibold block text-center">
              ⚡ Hızlı PoC Test Hesapları
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('gorkem')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 text-left transition-all group cursor-pointer"
              >
                <span className="font-semibold text-white block group-hover:text-cyan-300">
                  Görkem (Girişimci)
                </span>
                <span className="text-[10px] text-slate-400">Dolu takvim & akışlar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('zeynep')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 text-left transition-all group cursor-pointer"
              >
                <span className="font-semibold text-white block group-hover:text-rose-300">
                  Zeynep (Mimar)
                </span>
                <span className="text-[10px] text-slate-400">Tasarım & teslimat</span>
              </button>
            </div>

            {/* Sıfırdan Yeni Kullanıcı Button (Triggers Fast Start Pop-up!) */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('fresh_user')}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 hover:from-cyan-950/80 hover:to-indigo-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>✨ Sıfırdan Yeni Profil Aç (Fast Start Pop-Up)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
