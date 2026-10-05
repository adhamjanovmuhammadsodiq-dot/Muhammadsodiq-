import React, { useState, useEffect } from 'react';
import { ApiClient } from '../lib/api.ts';
import { AlertCircle, CheckCircle2, RotateCcw, BookOpen, ArrowRight, Lightbulb } from 'lucide-react';

interface MistakesBankViewProps {
  onGoToTests: () => void;
}

export const MistakesBankView: React.FC<MistakesBankViewProps> = ({ onGoToTests }) => {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePracticeAnswers, setActivePracticeAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadMistakes() {
      try {
        setLoading(true);
        const data = await ApiClient.getMyMistakes();
        setMistakes(data);
      } catch (err) {
        console.error('Xatolarni yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMistakes();
  }, []);

  const handleSelectPracticeOption = (questionId: string, optKey: string) => {
    setActivePracticeAnswers(prev => ({
      ...prev,
      [questionId]: optKey
    }));
  };

  const toggleSolution = (questionId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Xatolar Banki va Mustahkamlash
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Oldingi testlarda xato qilingan savollar to'plami. Bu yerda ularni qayta yechib, bilmingizni mustahkamlang.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : mistakes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Xatolar banki bo'sh!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Siz barcha savollarga to'g'ri javob bergansiz yoki hali test topshirmagansiz. Bilimingizni sinash uchun testlarni boshlang.
          </p>
          <button
            onClick={onGoToTests}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Testlar ro'yxatiga o'tish
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Jami xatolar soni: <b>{mistakes.length} ta</b></span>
            <span>Qayta urinish uchun variantni bosing</span>
          </div>

          {mistakes.map((m, idx) => {
            const userPracticeChoice = activePracticeAnswers[m.questionId];
            const isCorrect = userPracticeChoice === m.correctOption;
            const isRevealed = revealedSolutions[m.questionId];

            return (
              <div
                key={m.questionId || idx}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {m.subject}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {m.testTitle}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSolution(m.questionId)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isRevealed ? 'Yechimni yashirish' : 'Yechimni ko\'rish'}</span>
                  </button>
                </div>

                {/* Question Text */}
                <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                  {m.questionText}
                </h3>

                {/* Interactive Practice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {m.options?.map((opt: any) => {
                    const isChoice = userPracticeChoice === opt.key;
                    const showSuccess = userPracticeChoice && opt.key === m.correctOption;
                    const showFailure = userPracticeChoice && isChoice && !isCorrect;

                    let btnStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                    if (showSuccess) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20';
                    } else if (showFailure) {
                      btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectPracticeOption(m.questionId, opt.key)}
                        className={`p-3 rounded-xl border text-xs text-left flex items-center gap-3 transition-all ${btnStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                          showSuccess
                            ? 'bg-emerald-600 text-white'
                            : showFailure
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="leading-snug flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Practice Feedback */}
                {userPracticeChoice && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Barakalla! To'g'ri javobni topdingiz!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Noto'g'ri. To'g'ri variant: <b>{m.correctOption}</b></span>
                      </>
                    )}
                  </div>
                )}

                {/* Solution Dropdown */}
                {isRevealed && m.explanation && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1 animate-in fade-in">
                    <span className="font-semibold text-indigo-800 dark:text-indigo-300 block">
                      💡 Muallif tushuntirishi:
                    </span>
                    <p className="leading-relaxed">
                      {m.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
