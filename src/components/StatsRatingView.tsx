import React, { useState, useEffect } from 'react';
import { ApiClient } from '../lib/api.ts';
import { Submission } from '../types.ts';
import { Trophy, Award, TrendingUp, Users, Target, BookCheck } from 'lucide-react';

export const StatsRatingView: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Can read recent submissions if public or via general stats
        const data = await ApiClient.getAdminSubmissions().catch(() => []);
        setSubmissions(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute student rankings
  const studentMap = new Map<string, { name: string; phone: string; totalScore: number; testsCount: number; passedCount: number }>();

  for (const s of submissions) {
    const existing = studentMap.get(s.studentPhone) || {
      name: s.studentName,
      phone: s.studentPhone,
      totalScore: 0,
      testsCount: 0,
      passedCount: 0
    };
    existing.totalScore += s.percentage;
    existing.testsCount += 1;
    if (s.passed) existing.passedCount += 1;
    studentMap.set(s.studentPhone, existing);
  }

  const leaderboards = Array.from(studentMap.values())
    .map(st => ({
      ...st,
      avgPercentage: Math.round(st.totalScore / st.testsCount)
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage || b.testsCount - a.testsCount)
    .slice(0, 10);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Bilim Arena — Yetakchilar Reytingi va Statistika
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Eng yuqori natija ko'rsatgan bilimdonlar va fanlar kesimidagi umumiy ko'rsatkichlar
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboards.slice(0, 3).map((lead, idx) => {
          const medalColors = [
            'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
          ];

          return (
            <div
              key={lead.phone}
              className={`p-5 rounded-2xl border ${medalColors[idx]} relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {idx + 1}-O'rin
                </span>
                <Trophy className="w-5 h-5 opacity-80" />
              </div>

              <div>
                <h3 className="text-base font-bold truncate">
                  {lead.name}
                </h3>
                <p className="text-xs opacity-75 font-mono">
                  {lead.phone.slice(0, 7)} *** ** {lead.phone.slice(-2)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/20 flex items-center justify-between text-xs font-mono">
                <span>O'rtacha natija:</span>
                <span className="text-lg font-extrabold">{lead.avgPercentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Top Bilimdonlar Ro'yxati</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {leaderboards.length} nafar o'quvchi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold">O'quvchi</th>
                <th className="px-4 py-3 font-semibold text-center">Topshirgan testlari</th>
                <th className="px-4 py-3 font-semibold text-center">Muvaffaqiyatli</th>
                <th className="px-4 py-3 font-semibold text-right">O'rtacha foiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Hozircha reyting ma'lumotlari shakllanmoqda.
                  </td>
                </tr>
              ) : (
                leaderboards.map((st, i) => (
                  <tr key={st.phone} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold font-mono text-center text-slate-400">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {st.testsCount} ta
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-emerald-600 dark:text-emerald-400">
                      {st.passedCount} ta
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {st.avgPercentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
