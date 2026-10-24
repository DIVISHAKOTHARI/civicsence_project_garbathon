import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockAuth } from '../lib/mockStore';
import { Building2, ShieldCheck, MapPin, Sun, Moon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      mockAuth.signIn(email);
    }
  };

  const handleDemoLogin = () => {
    mockAuth.signIn('demo.citizen@example.com');
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Settings bar for login */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className="flex items-center bg-white/80 dark:bg-slate-800/80 rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-slate-700 backdrop-blur-md">
          {(['en', 'hi', 'gu'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                language === lang 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-100 dark:border-slate-700 backdrop-blur-md"
        >
          {theme === 'light' ? <Moon size={20} className="fill-slate-600" /> : <Sun size={20} className="fill-yellow-400 text-yellow-400" />}
        </button>
      </div>

      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-60"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('appName')}</h1>
            <p className="text-slate-500 dark:text-slate-400">{t('tagline')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{t('emailLabel')}</label>
              <input 
                type="email" 
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/20"
            >
              {t('signIn')}
            </button>
          </form>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase">Or quick demo</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 px-6 rounded-2xl font-medium border border-slate-200 dark:border-slate-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Continue as Guest
          </button>

          <p className="mt-8 text-xs text-slate-400 text-center">
            {t('demoMode')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
