import React, { useEffect, useRef } from 'react';
import { Submission, QuestionResult } from '../types.ts';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, AlertCircle, Clock, Award, ArrowLeft, RotateCcw, Printer, Share2, FileCheck } from 'lucide-react';

interface TestResultViewProps {
  submission: Submission;
  onRetake: () => void;
  onBackToTests: () => void;
  onGoToMistakes?: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({ submission, onRetake, onBackToTests, onGoToMistakes }) => {
  const confettiRan = useRef(false);

  useEffect(() => {
    if (submission.passed && !confettiRan.current) {
      confettiRan.current = true;
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4']
        });
      } catch {
        // ignore
      }
    }
  }, [submission.passed]);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} daqiqa ${s} soniya`;
  };

  const handlePrint = () => {
    window.print();
  };

  const certificateId = `BA-2026-${submission.id.replace('sub-', '').toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBackToTests}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha testlarga qaytish</span>
        </button>

        <div className="flex items-center gap-2">
          {submission.incorrectCount > 0 && onGoToMistakes && (
            <button
              onClick={onGoToMistakes}
              className="h-9 px-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span>Xatolarni ishlash ({submission.incorrectCount})</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Sertifikatni chop etish</span>
          </button>
          <button
            onClick={onRetake}
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta topshirish</span>
          </button>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <span>{submission.subject}</span>
              <span>·</span>
              <span>Rasmiy Tekshiruv Natijasi</span>
              <span>·</span>
              <span className="font-mono text-slate-500">ID: {certificateId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {submission.testTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Topshiruvchi: <b>{submission.studentName}</b> ({submission.studentPhone}) · {new Date(submission.submittedAt).toLocaleString('uz-UZ')}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-center sm:items-end">
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold ${
              submission.passed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {submission.passed ? (
                <>
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>MUVAFFAQIYATLI O'TDINGIZ</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>O'TISH BALI YETMADI</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Umumiy Natija</span>
            <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {submission.percentage}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">To'plangan Ball</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {submission.score} <span className="text-sm font-normal text-slate-400">/ {submission.maxScore}</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">To'g'ri / Noto'g'ri</span>
            <div className="text-lg font-bold font-mono flex items-center justify-center gap-2 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400">{submission.correctCount} to'g'ri</span>
              <span className="text-slate-300">/</span>
              <span className="text-rose-600 dark:text-rose-400">{submission.incorrectCount} noto'g'ri</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Sarflangan Vaqt</span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-2 block">
              {formatSeconds(submission.timeSpentSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Question Review Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Savollar tahlili va to'g'ri yechimlar</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Jami {submission.totalQuestions} ta savol
          </span>
        </div>

        <div className="space-y-4">
          {submission.results?.map((res: QuestionResult, idx: number) => {
            return (
              <div
                key={res.questionId}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  res.isCorrect
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-rose-200/70 dark:border-rose-900/50'
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <span className="text-xs font-bold text-slate-500">
                    Savol {idx + 1}
                  </span>

                  <div>
                    {res.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        To'g'ri (+{res.pointsEarned} ball)
                      </span>
                    ) : res.isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <AlertCircle className="w-4 h-4" />
                        Belgilanmagan (0 ball)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <XCircle className="w-4 h-4" />
                        Noto'g'ri (0 ball)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question title */}
                <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed mb-4">
                  {res.questionText}
                </h3>

                {/* Options representation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {res.options.map(opt => {
                    const isUserChoice = res.userAnswer === opt.key;
                    const isRightAnswer = res.correctOption === opt.key;

                    let style = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                    if (isRightAnswer) {
                      style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500';
                    } else if (isUserChoice && !isRightAnswer) {
                      style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500 line-through';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isRightAnswer
                            ? 'bg-emerald-600 text-white'
                            : isUserChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Teacher explanation */}
                {res.explanation && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                    <span className="font-semibold text-indigo-800 dark:text-indigo-300 block">
                      💡 To'g'ri yechim va izoh:
                    </span>
                    <p className="leading-relaxed">
                      {res.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
