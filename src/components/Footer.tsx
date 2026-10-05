import React from 'react';
import { Send, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[10px]">
            B
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Bilim Arena</span>
          <span>· Professional onlayn ta'lim va imtihon platformasi</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Xavfsiz server-side tekshiruv</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            <span>Telegram bot bilan himoyalangan</span>
          </span>
        </div>

        <div>
          <span>© {new Date().getFullYear()} Bilim Arena. Barcha huquqlar himoyalangan.</span>
        </div>
      </div>
    </footer>
  );
};
