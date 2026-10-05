import React, { useState, useEffect } from 'react';
import { Submission } from '../types.ts';
import { ApiClient } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Award, Clock, ArrowRight, CheckCircle2, XCircle, BookOpen, RefreshCw } from 'lucide-react';

interface MySubmissionsViewProps {
  onSelectSubmission: (sub: Submission) => void;
  onGoToTests: () => void;
}

export const MySubmissionsView: React.FC<MySubmissionsViewProps> = ({ onSelectSubmission, onGoToTests }) => {
  const { user, openAuthModal } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await ApiClient.getMySubmissions();
        setSubmissions(data);
      } catch (err: any) {
        setError(err.message || 'Natijalarni yuklashda xatolik.');
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <Award className="w-12 h-12 text-indigo-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Mening Natijalarim
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          O'z natijalaringiz va to'plagan ballaringizni ko'rish uchun profilingizga kiring.
        </p>
        <button
          onClick={() => openAuthModal('student')}
          className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Tizimga kirish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Mening Natijalarim va Sertifikatlarim
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Topshirilgan testlar tarixi va batafsil yechimlar tahlili
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 text-xs text-rose-700">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Hali test topshirmagansiz
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mavjud testlardan birini tanlang va o'z bilim darajangizni sinab ko'ring.
          </p>
          <button
            onClick={onGoToTests}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Testlar ro'yxatiga o'tish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const dateStr = new Date(sub.submittedAt).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    sub.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}>
                    {sub.passed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                      {sub.subject} · {dateStr}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {sub.testTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{sub.correctCount} to'g'ri / {sub.totalQuestions} ta</span>
                      <span>·</span>
                      <span>Vaqt: {Math.round(sub.timeSpentSeconds / 60)} daq</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block">
                      {sub.percentage}%
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {sub.score} / {sub.maxScore} ball
                    </span>
                  </div>

                  <button className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <span>Tahlil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
