import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ApiClient } from '../lib/api.ts';
import { X, Send, Lock, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Phone, UserCheck, KeyRound, ExternalLink } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(authModalTab);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Student form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('BilimArenaBot');
  const [simulationCode, setSimulationCode] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Teacher form state
  const [teacherPhone, setTeacherPhone] = useState('+998 90 123 45 67');
  const [teacherPass, setTeacherPass] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(authModalTab);
    setStep('form');
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalTab, isAuthModalOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  if (!isAuthModalOpen) return null;

  // Phone input formatting (+998 XX XXX XX XX)
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^\d+]/g, '');
    if (!raw.startsWith('+998')) {
      setPhone('+998 ');
      return;
    }
    const digits = raw.replace(/\D/g, '').substring(3); // after 998
    let formatted = '+998';
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.substring(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);
    setPhone(formatted);
  };

  // Submit step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.requestOtp({
        firstName,
        lastName,
        phone,
        role: 'student',
      });

      setTelegramUrl(res.telegramBotUrl);
      setTelegramUsername(res.telegramUsername || 'TestProOnlineBot');
      setSimulationCode(res.devSimulationOtp || null);
      setTimerSeconds(res.expiresInSeconds || 300);
      setStep('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Kod yuborishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('6 xonali tasdiqlash kodini to\'liq kiriting.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.verifyOtp({
        phone,
        code: otpCode,
        firstName,
        lastName,
      });

      setUser(res.user);
      setSuccessMessage('Muvaffaqiyatli tasdiqlandi! Xush kelibsiz.');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tasdiqlash kodi noto\'g\'ri.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Teacher direct login
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.adminLogin({
        passCode: teacherPass,
        phone: teacherPhone,
      });

      setUser(res.user);
      setSuccessMessage('O\'qituvchi paneliga xush kelibsiz!');
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Maxfiy kalit so\'z noto\'g\'ri.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {activeTab === 'student' ? 'O\'quvchi sifatida kirish' : 'O\'qituvchilar kabineti'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'student' 
                ? 'Telegram bot orqali xavfsiz tasdiqlash' 
                : 'Muallimlar va ma\'muriyat uchun maxsus kirish'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors ${
              activeTab === 'student'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            O'quvchi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-medium text-center border-b-2 transition-colors ${
              activeTab === 'teacher'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            O'qituvchi / Administrator
          </button>
        </div>

        {/* Feedback notices */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {activeTab === 'student' && step === 'form' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ismingiz
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Familiyangiz
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Rahimov"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Telefon raqamingiz
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-colors"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tasdiqlash kodi Telegram botingizga yuboriladi.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Davom etish</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Loginsiz to'g'ridan-to'g'ri testlarni yechish
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Kirgandan so'ng 30 kun davomida qayta login talab qilinmaydi.
                </span>
              </div>
            </form>
          )}

          {activeTab === 'student' && step === 'otp' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                  <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Telegram bot orqali kodni oling
                </div>
                <p className="leading-relaxed">
                  Tasdiqlash kodi Telegram botimizda shakllantirildi. Quyidagi tugma orqali botga o'ting va <b>Start</b> tugmasini bosing:
                </p>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <span>Telegram botga o'tish (@{telegramUsername})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Instant Dev / Sandbox Helper Code */}
              {simulationCode && (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      Telegram kodi (Tezkor kiritish):
                    </span>
                    <span className="font-mono text-base font-bold tracking-widest text-slate-900 dark:text-white">
                      {simulationCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(simulationCode);
                    }}
                    className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-medium"
                  >
                    Kodni qo'yish
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      6 xonali tasdiqlash kodi
                    </label>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Vaqt: {formatTimer(timerSeconds)}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest text-2xl font-mono py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6 || timerSeconds === 0}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Tasdiqlash va Kirish</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    ← Raqamni o'zgartirish
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={timerSeconds > 240}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40"
                  >
                    Qayta yuborish
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  O'qituvchi telefon raqami
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={teacherPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Maxfiy kalit so'z (Admin Secret)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Kalit so'zni kiriting"
                    value={teacherPass}
                    onChange={(e) => setTeacherPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Standart kalit: <code>admin123</code> yoki <code>ustoz2026</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>O'qituvchi sifatida kirish</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
