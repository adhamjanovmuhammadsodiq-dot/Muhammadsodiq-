import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Sun, Moon, User as UserIcon, LogOut, ShieldCheck, Menu, X, BookOpen, Award, BarChart2 } from 'lucide-react';

interface HeaderProps {
  currentView: 'tests' | 'results' | 'mistakes' | 'stats' | 'teacher';
  onNavigate: (view: 'tests' | 'results' | 'mistakes' | 'stats' | 'teacher') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, openAuthModal, logout, darkMode, toggleDarkMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tests')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-indigo-600/20">
              B
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Bilim Arena
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('tests')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white py-1 relative cursor-pointer ${
              currentView === 'tests' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Testlar
            {currentView === 'tests' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('results')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white py-1 relative cursor-pointer ${
              currentView === 'results' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Natijalarim
            {currentView === 'results' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('mistakes')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white py-1 relative cursor-pointer ${
              currentView === 'mistakes' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Xatolarim
            {currentView === 'mistakes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('stats')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white py-1 relative cursor-pointer ${
              currentView === 'stats' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Reyting
            {currentView === 'stats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('teacher')}
            className={`transition-colors hover:text-slate-900 dark:hover:text-white py-1 relative cursor-pointer ${
              currentView === 'teacher' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            O'qituvchilarga
            {currentView === 'teacher' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
            aria-label="Yorug' yoki qorong'u rejim"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-amber-500 dark:text-amber-400 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* User state / Auth action */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                  {user.role === 'teacher' || user.role === 'admin' ? "O'qituvchi" : "O'quvchi"}
                </span>
              </div>
              <button
                onClick={logout}
                title="Chiqish"
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('student')}
                className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserIcon className="w-4 h-4" />
                Kirish
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onNavigate('tests');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'tests'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Testlar ro'yxati
          </button>
          
          <button
            onClick={() => {
              onNavigate('results');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'results'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Mening natijalarim
          </button>

          <button
            onClick={() => {
              onNavigate('mistakes');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'mistakes'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Xatolar banki
          </button>

          <button
            onClick={() => {
              onNavigate('stats');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'stats'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Umumiy reyting va statistika
          </button>

          <button
            onClick={() => {
              onNavigate('teacher');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'teacher'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            O'qituvchi / Administrator kabineti
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                toggleDarkMode();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                <span>{darkMode ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {darkMode ? 'Tungi' : 'Kunduzgi'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
