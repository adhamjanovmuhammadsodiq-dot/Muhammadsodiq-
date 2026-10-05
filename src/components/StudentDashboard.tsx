import React, { useState, useEffect } from 'react';
import { TestSummary } from '../types.ts';
import { ApiClient } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { BookOpen, Clock, Award, Search, ArrowRight, Zap, Lightbulb, Target, Sparkles, Trophy } from 'lucide-react';

interface StudentDashboardProps {
  onStartTest: (testId: string) => void;
  onStartBlitz: () => void;
  onGoToMistakes: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartTest,
  onStartBlitz,
  onGoToMistakes
}) => {
  const { user, openAuthModal } = useAuth();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const data = await ApiClient.getActiveTests();
        setTests(data);
      } catch (err: any) {
        setError(err.message || 'Testlarni yuklashda xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const subjects = ['all', 'Matematika', 'Fizika', 'Ona tili', 'IT va Dasturlash'];
  const categories = ['all', 'DTM', 'Olimpiada', 'Sertifikat'];

  const filteredTests = tests.filter(t => {
    const matchesSubject = selectedSubject === 'all' || t.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hero_test_education_1791171035247.jpg"
            alt="Bilim Arena imtihon va ta'lim maydoni"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O'zbekistonning innovatsion ta'lim va test arenasi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Bilim Arena — Kuchingizni Haqiqiy Imtihonda Sinang
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            DTM standarti, xalqaro olimpiada savollari va kasbiy sertifikatlar. Testni darhol boshlang, natijalarni soniyalarda oling va tahlil qiling.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('tests-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Testlarni ko'rish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartBlitz}
              className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Tezkor Blitz (5 savol)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Launch Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={onStartBlitz}
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Ekspress Blitz Arena
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              5 ta tasodifiy savoldan iborat 5 daqiqalik chaqqonlik sinovi.
            </p>
          </div>
        </div>

        <div
          onClick={onGoToMistakes}
          className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Xatolar Banki
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Avval xato qilgan savollaringizni tahlil qiling va qayta ishlang.
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            const el = document.getElementById('tests-grid');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              DTM va Milliy Sertifikat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Oliy ta'lim muassasalariga kirish standartidagi rasmiy testlar.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section id="tests-grid" className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Imtihonlar va Fan Testlari
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Istalgan testni tanlang va to'g'ridan-to'g'ri ishlashni boshlang
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Test yoki fanni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Categories and Subjects Filter Bar */}
        <div className="space-y-2.5">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {subjects.map(subj => {
              const isSelected = selectedSubject === subj;
              const label = subj === 'all' ? 'Barcha fanlar' : subj;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
              Format:
            </span>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              const label = cat === 'all' ? 'Barcha formatlar' : cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Hech qanday test topilmadi
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Qidiruv so'zini o'zgartirib ko'ring yoki boshqa fanni tanlang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const isMath = test.subject.toLowerCase().includes('matematika') || test.subject.toLowerCase().includes('fizika');
            const isIT = test.subject.toLowerCase().includes('it') || test.subject.toLowerCase().includes('informatika');

            const diff = test.difficulty || 'O\'rta';
            const diffColor =
              diff === 'Oson'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                : diff === 'Qiyin'
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
                : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';

            return (
              <div
                key={test.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col shadow-sm hover:shadow-md"
              >
                {/* Visual Header */}
                <div className="h-36 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      isMath
                        ? '/src/assets/images/subject_stem_math_1791171049470.jpg'
                        : isIT
                        ? '/src/assets/images/subject_it_code_1791171061691.jpg'
                        : '/src/assets/images/hero_test_education_1791171035247.jpg'
                    }
                    alt={test.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      {test.subject}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffColor}`}>
                      {diff}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {test.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Metadata Specs (Zero-pill text separators) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{test.questionsCount} ta savol</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{test.durationMinutes} daqiqa</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{test.passingScore}% o'tish</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartTest(test.id)}
                      className="w-full mt-4 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Testni boshlash</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
