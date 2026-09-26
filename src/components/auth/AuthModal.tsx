import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Lock,
  Key,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Trash2,
  Globe,
  AlertCircle,
  Sparkles,
  User,
  Mail,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { AuthUser, TwoFactorChallenge } from '../../types/ayzek';
import { api } from '../../services/api';
import { GlassCard } from '../design-system/GlassCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onAuthSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'devices' | 'security'>('login');
  const [email, setEmail] = useState('gorkem.elligram@grispi.com');
  const [password, setPassword] = useState('ayzek2026password');
  const [name, setName] = useState('Görkem');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 2FA Verification State
  const [pending2FA, setPending2FA] = useState<TwoFactorChallenge | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.login(email, password, 'Mevcut Tarayıcı (Web Senkron)');
      if (res.success) {
        if (res.requires2FA && res.challenge) {
          setPending2FA(res.challenge);
          setSuccessMsg('2FA Doğrulama kodu bekleniyor. Demo test kodunuz: 482910');
        } else if (res.user) {
          onAuthSuccess(res.user);
          setSuccessMsg('Giriş başarılı! Verileriniz eşitlendi.');
          setTimeout(() => onClose(), 800);
        }
      } else {
        setErrorMsg(res.message || 'Giriş yapılamadı.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending2FA) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.verify2FA(pending2FA.tempToken, twoFactorCode, trustDevice);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        setPending2FA(null);
        setSuccessMsg('2FA Doğrulaması başarılı! Tüm cihazlarınızla kesintisiz senkronizasyon aktif.');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMsg(res.message || 'Hatalı kod. Lütfen 482910 kodunu deneyin.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Doğrulama hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.register(email, password, name, true);
      if (res.success) {
        setSuccessMsg('Hesap açıldı! Lütfen giriş yapın.');
        setTab('login');
      } else {
        setErrorMsg(res.message || 'Kayıt başarısız.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Kayıt hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    try {
      const res = await api.disconnectDevice(deviceId);
      if (res.success && currentUser) {
        onAuthSuccess({
          ...currentUser,
          devices: currentUser.devices.filter((d) => d.deviceId !== deviceId),
        });
        setSuccessMsg('Cihaz oturumu başarıyla sonlandırıldı.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    try {
      const res = await api.toggle2FA(enable);
      if (res.success && currentUser) {
        onAuthSuccess({ ...currentUser, is2FAEnabled: enable });
        setSuccessMsg(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/90 border border-white/15 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_16px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                AYZEK Kimlik & 2FA Güvenliği
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Farklı cihazlardan kesintisiz oturum ve güvenli veri eşitlemesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2FA Verification Challenge Step */}
        {pending2FA ? (
          <form onSubmit={handleVerify2FA} className="mt-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                <Key className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-white">İki Aşamalı Doğrulama (2FA)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Lütfen Authenticator uygulamanızdaki 6 haneli kodu veya kayıtlı numaranıza gönderilen şifreyi girin.
              </p>
              <div className="mt-2 text-[11px] text-cyan-300 font-mono bg-cyan-500/10 py-1 px-2 rounded-lg inline-block border border-cyan-500/20">
                Demo Doğrulama Kodu: <strong className="text-white">482910</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                6 Haneli Doğrulama Kodu
              </label>
              <div className="flex justify-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="482910"
                  autoFocus
                  className="w-48 text-center tracking-[0.4em] font-mono text-xl py-2.5 px-4 rounded-xl bg-slate-950 border border-cyan-500/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0"
                />
                <span>Bu cihazı güvenli olarak kaydet (30 gün)</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPending2FA(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
              >
                Geri Dön
              </button>
              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length < 4}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Doğrula ve Başlat</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Nav Tabs */}
            <div className="flex gap-1.5 mt-4 p-1 rounded-2xl bg-slate-950/70 border border-white/10">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  tab === 'login' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setTab('devices')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  tab === 'devices' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cihazlarım ({currentUser?.devices.length || 4})
              </button>
              <button
                onClick={() => setTab('security')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  tab === 'security' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                2FA Güvenlik
              </button>
            </div>

            {/* TAB: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    E-Posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Demo Helper Pill */}
                <div className="p-2 rounded-xl bg-slate-950/50 border border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Demo Hesap Bilgisi:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('gorkem.elligram@grispi.com');
                      setPassword('ayzek2026password');
                    }}
                    className="text-cyan-400 hover:underline font-mono"
                  >
                    Bilgileri Doldur
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>2FA ile Güvenli Giriş Yap</span>
                </button>
              </form>
            )}

            {/* TAB: DEVICES & MULTI-DEVICE SYNC */}
            {tab === 'devices' && (
              <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Farklı cihazlardan giriş yapsanız da tüm hafıza, plan, döngü ve görevleriniz anında senkronize kalır.
                  </span>
                </div>

                {(currentUser?.devices || []).map((dev) => {
                  const Icon =
                    dev.deviceType === 'mobile'
                      ? Smartphone
                      : dev.deviceType === 'tablet'
                      ? Tablet
                      : Laptop;

                  return (
                    <div
                      key={dev.deviceId}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            dev.isCurrentDevice
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white">{dev.deviceName}</span>
                            {dev.isCurrentDevice && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                                Bu Cihaz
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {dev.locationSnippet} · Son aktif: {dev.isCurrentDevice ? 'Şimdi' : dev.lastActiveAt.slice(11, 16)}
                          </p>
                        </div>
                      </div>

                      {!dev.isCurrentDevice && (
                        <button
                          onClick={() => handleDisconnectDevice(dev.deviceId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Cihaz Oturumunu Kapat"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: 2FA & SECURITY SETTINGS */}
            {tab === 'security' && (
              <div className="mt-4 space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      İki Aşamalı Doğrulama (2FA)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Yeni cihazdan girişte 6 haneli şifre veya Authenticator onayı ister.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle2FA(!currentUser?.is2FAEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      currentUser?.is2FAEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentUser?.is2FAEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Doğrulama Yöntemi:</span>
                    <span className="text-cyan-400 font-mono">Google / Microsoft Authenticator (TOTP)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Yedek Güvenlik Kodları:</span>
                    <span className="text-emerald-400 font-mono">{currentUser?.backupCodesRemaining || 8} Kod Kaldı</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Gizlilik & Uçtan Uca Şifreleme:</span>
                    <span className="text-cyan-300 font-mono">AES-256 Aktif</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Oturumu Kapat</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
