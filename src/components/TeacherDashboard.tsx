import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ApiClient } from '../lib/api.ts';
import { AdminStats, Submission, Question } from '../types.ts';
import { PlusCircle, Trash2, Edit3, Save, CheckCircle2, Download, Search, Settings, HelpCircle, Layers, Users, BarChart3, Bot, ArrowRight, ShieldAlert } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'tests' | 'create' | 'submissions' | 'telegram'>('tests');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Search in submissions
  const [searchSubmission, setSearchSubmission] = useState('');

  // Create/Edit test state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matematika');
  const [newDescription, setNewDescription] = useState('');
  const [newGrade, setNewGrade] = useState('11-sinf / Abituriyent');
  const [newDifficulty, setNewDifficulty] = useState<'Oson' | 'O\'rta' | 'Qiyin'>('O\'rta');
  const [newCategory, setNewCategory] = useState<'DTM' | 'Olimpiada' | 'Sertifikat' | 'Umumiy'>('DTM');
  const [newDuration, setNewDuration] = useState(20);
  const [newPassingScore, setNewPassingScore] = useState(60);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      text: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      correctOption: 'A',
      explanation: '',
      points: 2
    }
  ]);
  const [savingTest, setSavingTest] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Telegram bot info
  const [telegramInfo, setTelegramInfo] = useState<{ username: string; isConfigured: boolean } | null>(null);

  const isTeacherOrAdmin = user && (user.role === 'teacher' || user.role === 'admin');

  useEffect(() => {
    if (isTeacherOrAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isTeacherOrAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, testsData, subsData, tgData] = await Promise.all([
        ApiClient.getAdminStats(),
        ApiClient.getAdminTests(),
        ApiClient.getAdminSubmissions(),
        ApiClient.getTelegramInfo()
      ]);

      setStats(statsData);
      setTests(testsData);
      setSubmissions(subsData);
      setTelegramInfo(tgData);
    } catch (err) {
      console.error('Admin ma\'lumotlarini yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setNewQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        text: '',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' }
        ],
        correctOption: 'A',
        explanation: '',
        points: 2
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (newQuestions.length <= 1) return;
    setNewQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setNewQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text };
      return copy;
    });
  };

  const handleOptionTextChange = (qIdx: number, optKey: 'A' | 'B' | 'C' | 'D', text: string) => {
    setNewQuestions(prev => {
      const copy = [...prev];
      const opts = copy[qIdx].options.map(o => o.key === optKey ? { ...o, text } : o);
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleCorrectOptionChange = (qIdx: number, key: 'A' | 'B' | 'C' | 'D') => {
    setNewQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctOption: key };
      return copy;
    });
  };

  const handleExplanationChange = (qIdx: number, explanation: string) => {
    setNewQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation };
      return copy;
    });
  };

  const handleParseBulkQuestions = () => {
    if (!bulkImportText.trim()) return;

    const rawBlocks = bulkImportText.split(/(?:\n\s*\n|\n(?=\d+[\.\)])|(?=Savol\s*\d+))/i);
    const parsed: Question[] = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      const block = rawBlocks[i].trim();
      if (!block) continue;

      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let questionText = lines[0].replace(/^(\d+[\.\)]|Savol\s*\d+[\.\:]?)\s*/i, '');

      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let correct: 'A' | 'B' | 'C' | 'D' = 'A';
      let explanation = '';

      for (let j = 1; j < lines.length; j++) {
        const line = lines[j];
        if (/^A[\)\.]\s*/i.test(line)) optA = line.replace(/^A[\)\.]\s*/i, '');
        else if (/^B[\)\.]\s*/i.test(line)) optB = line.replace(/^B[\)\.]\s*/i, '');
        else if (/^C[\)\.]\s*/i.test(line)) optC = line.replace(/^C[\)\.]\s*/i, '');
        else if (/^D[\)\.]\s*/i.test(line)) optD = line.replace(/^D[\)\.]\s*/i, '');
        else if (/^(Javob|To'g'ri javob|To'g'ri)\s*[:=]\s*([A-D])/i.test(line)) {
          const match = line.match(/(?:Javob|To'g'ri javob|To'g'ri)\s*[:=]\s*([A-D])/i);
          if (match) correct = match[1].toUpperCase() as any;
        } else if (/^(Izoh|Yechim|Tushuntirish)\s*[:=]\s*/i.test(line)) {
          explanation = line.replace(/^(Izoh|Yechim|Tushuntirish)\s*[:=]\s*/i, '');
        } else if (!optA) {
          questionText += ' ' + line;
        }
      }

      if (questionText && optA && optB) {
        parsed.push({
          id: `q-${Date.now()}-${parsed.length + 1}`,
          text: questionText,
          options: [
            { key: 'A', text: optA || 'Variant A' },
            { key: 'B', text: optB || 'Variant B' },
            { key: 'C', text: optC || 'Variant C' },
            { key: 'D', text: optD || 'Variant D' }
          ],
          correctOption: correct,
          explanation: explanation || '',
          points: 2
        });
      }
    }

    if (parsed.length > 0) {
      setNewQuestions(parsed);
      setShowBulkImport(false);
      setBulkImportText('');
      setSaveSuccess(`${parsed.length} ta savol muvaffaqiyatli import qilindi!`);
    } else {
      alert('Matndan savollarni ajratib bo\'lmadi. Namuna formatiga mosligini tekshiring.');
    }
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    // Validate
    if (!newTitle.trim()) {
      setSaveError('Test nomini kiriting.');
      return;
    }

    for (let i = 0; i < newQuestions.length; i++) {
      if (!newQuestions[i].text.trim()) {
        setSaveError(`${i + 1}-savol matnini to'liq kiriting.`);
        return;
      }
      for (const opt of newQuestions[i].options) {
        if (!opt.text.trim()) {
          setSaveError(`${i + 1}-savolning ${opt.key} variantini to'ldiring.`);
          return;
        }
      }
    }

    try {
      setSavingTest(true);
      await ApiClient.createTest({
        title: newTitle,
        subject: newSubject,
        description: newDescription,
        grade: newGrade,
        durationMinutes: newDuration,
        passingScore: newPassingScore,
        difficulty: newDifficulty,
        category: newCategory,
        active: true,
        questions: newQuestions
      });

      setSaveSuccess('Yangi test muvaffaqiyatli saqlandi va platformada e\'lon qilindi!');
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewQuestions([
        {
          id: 'q-1',
          text: '',
          options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' }
          ],
          correctOption: 'A',
          explanation: '',
          points: 2
        }
      ]);
      loadAdminData();
      setActiveTab('tests');
    } catch (err: any) {
      setSaveError(err.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSavingTest(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Haqiqatan ham bu testni o\'chirmoqchimisiz?')) return;
    try {
      await ApiClient.deleteTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi.');
    }
  };

  const handleToggleActive = async (test: any) => {
    try {
      const updated = await ApiClient.updateTest(test.id, { active: !test.active });
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, active: updated.active } : t));
    } catch (err: any) {
      alert(err.message || 'Holatni yangilashda xatolik.');
    }
  };

  // Export submissions to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('Eksport qilish uchun natijalar mavjud emas.');
      return;
    }

    const headers = ['Ism Familiya', 'Telefon', 'Test Nomi', 'Fan', 'Ball', 'Foiz', 'Holat', 'Sana'];
    const rows = submissions.map(s => [
      `"${s.studentName}"`,
      `"${s.studentPhone}"`,
      `"${s.testTitle}"`,
      `"${s.subject}"`,
      `${s.score}/${s.maxScore}`,
      `${s.percentage}%`,
      s.passed ? '"Otdi"' : '"Otmadi"',
      `"${new Date(s.submittedAt).toLocaleString('uz-UZ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bilim_Arena_Natijalar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isTeacherOrAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-indigo-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          O'qituvchi / Administrator Paneli
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ushbu bo'limga faqat o'qituvchilar va tizim ma'murlari kirishi mumkin.
        </p>
        <button
          onClick={() => openAuthModal('teacher')}
          className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          O'qituvchi sifatida kirish
        </button>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(s => {
    const q = searchSubmission.toLowerCase();
    return s.studentName.toLowerCase().includes(q) ||
           s.studentPhone.toLowerCase().includes(q) ||
           s.testTitle.toLowerCase().includes(q) ||
           s.subject.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            O'qituvchilar va Ma'muriyat Boshqaruv Markazi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Testlarni yaratish, tahrirlash, o'quvchilar natijalari va Telegram bot monitoringi
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yangi test yaratish</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Ro'yxatdan o'tgan o'quvchilar</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats.totalStudents}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Jami testlar soni</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats.totalTests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Topshirilgan testlar</span>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {stats.totalSubmissions}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>O'rtacha o'zlashtirish</span>
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {stats.averageScore}%
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'tests'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Mavjud testlar ({tests.length})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'create'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Yangi test tuzish
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'submissions'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          O'quvchilar natijalari ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'telegram'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Telegram Bot Integratsiyasi
        </button>
      </div>

      {/* Tab 1: Tests List */}
      {activeTab === 'tests' && (
        <div className="space-y-3">
          {tests.map(test => (
            <div
              key={test.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>{test.subject}</span>
                  <span>·</span>
                  <span>{test.grade}</span>
                  <span>·</span>
                  <span>{test.questions?.length || 0} ta savol</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {test.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(test)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    test.active
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {test.active ? 'Faol (Aktiv)' : 'Qoralama'}
                </button>

                <button
                  onClick={() => handleDeleteTest(test.id)}
                  title="O'chirish"
                  className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Create Test Builder */}
      {activeTab === 'create' && (
        <form onSubmit={handleSaveTest} className="space-y-6">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300">
              {saveSuccess}
            </div>
          )}

          {/* Test Meta settings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Asosiy Test Ma'lumotlari
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Test Sarlavhasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Kimyo: Organik birikmalar va reaksiyalar"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Fan
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Matematika">Matematika</option>
                  <option value="Fizika">Fizika</option>
                  <option value="Ona tili">Ona tili va adabiyot</option>
                  <option value="Ingliz tili">Ingliz tili</option>
                  <option value="IT va Dasturlash">IT va Dasturlash</option>
                  <option value="Biologiya">Biologiya</option>
                  <option value="Kimyo">Kimyo</option>
                  <option value="Tarix">Tarix</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sinf / Daraja
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 10-sinf yoki Abituriyent"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vaqt (daqiqa)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    O'tish bali (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Murakkablik Darajasi
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Oson">Oson</option>
                  <option value="O'rta">O'rta</option>
                  <option value="Qiyin">Qiyin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategoriya / Format
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="DTM">DTM</option>
                  <option value="Olimpiada">Olimpiada</option>
                  <option value="Sertifikat">Sertifikat</option>
                  <option value="Umumiy">Umumiy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Test Tavsifi
              </label>
              <textarea
                rows={2}
                placeholder="Ushbu test nimalarni o'z ichiga oladi..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Dynamic Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Savollar ({newQuestions.length} ta)
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(true)}
                  className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 rotate-180" />
                  <span>Matndan import</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="h-9 px-3 rounded-lg border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Savol qo'shish</span>
                </button>
              </div>
            </div>

            {newQuestions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {qIdx + 1}-Savol
                  </span>
                  {newQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Savol matni
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Savol matnini kiriting..."
                    value={q.text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map(opt => (
                    <div key={opt.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {opt.key} varianti
                        </span>
                        <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctOption === opt.key}
                            onChange={() => handleCorrectOptionChange(qIdx, opt.key)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={q.correctOption === opt.key ? 'text-emerald-600 font-bold' : ''}>
                            To'g'ri javob
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={`${opt.key} javob matni...`}
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(qIdx, opt.key, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                          q.correctOption === opt.key
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    To'g'ri yechim / Tushuntirish (izoh)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="O'quvchi testni topshirgach ko'radigan batafsil yechim..."
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={savingTest}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingTest ? 'Saqlanmoqda...' : 'Testni saqlash va e\'lon qilish'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Submissions Monitoring Table */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="O'quvchi yoki testni qidirish..."
                value={searchSubmission}
                onChange={(e) => setSearchSubmission(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors self-end"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel / CSV ga yuklash</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">O'quvchi</th>
                  <th className="px-4 py-3 font-semibold">Telefon</th>
                  <th className="px-4 py-3 font-semibold">Test nomi</th>
                  <th className="px-4 py-3 font-semibold">Fan</th>
                  <th className="px-4 py-3 font-semibold text-center">Natija</th>
                  <th className="px-4 py-3 font-semibold text-center">Holat</th>
                  <th className="px-4 py-3 font-semibold text-right">Topshirilgan vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Hech qanday natija topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {sub.studentName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {sub.studentPhone}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {sub.testTitle}
                      </td>
                      <td className="px-4 py-3.5 text-indigo-600 dark:text-indigo-400 font-medium">
                        {sub.subject}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {sub.percentage}% ({sub.score}/{sub.maxScore})
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.passed
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {sub.passed ? "O'tdi" : "O'tmadi"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleString('uz-UZ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Telegram Bot Integration */}
      {activeTab === 'telegram' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Telegram Bot Autentifikatsiya Integratsiyasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O'quvchilar SMS kodlarsiz to'g'ridan-to'g'ri Telegram bot orqali bir martalik kod bilan tizimga kiradilar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bot Foydalanuvchi Nomi (Username)
              </span>
              <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                @{telegramInfo?.username || 'TestProOnlineBot'}
              </p>
              <span className="text-[11px] text-slate-500 block">
                O'quvchilar saytdagi "Telegram botga o'tish" tugmasini bosganlarida ushbu botga yo'naltiriladilar.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                API Token Holati
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${telegramInfo?.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {telegramInfo?.isConfigured ? 'Telegram Bot Faol ulangan' : 'Simulyatsiya & Sinov rejimi'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Haqiqiy bot tokenini ulash uchun loyiha server sozlamalarida <code>TELEGRAM_BOT_TOKEN</code> o'zgaruvchisini kiriting.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
            <span className="font-semibold text-indigo-800 dark:text-indigo-300 block">
              💡 Telegram bot qanday ishlaydi?
            </span>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>O'quvchi saytga kirib o'z Ismi, Familiyasi va telefon raqamini kiritadi.</li>
              <li>Sayt avtomatik ravishda 6 xonali maxfiy bir martalik kod yaratadi va Telegram bot havolasini ochadi.</li>
              <li>O'quvchi botda <b>Start</b> tugmasini bosganda bot unga kodni taqdim etadi.</li>
              <li>Saytga kod kiritilgach, server uni tekshiradi va 30 kunga xavfsiz sessiya ochadi.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Savollarni matndan avtomatik import qilish
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Quyidagi formatda savollarni joylashtiring (kamida A va B variantlari bo'lishi shart):</p>
              <pre className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto">
{`1. O'zbekistonning poytaxti qaysi shahar?
A) Toshkent
B) Samarqand
C) Buxoro
D) Xiva
Javob: A
Izoh: Toshkent O'zbekistonning poytaxtidir.`}
              </pre>
            </div>

            <textarea
              rows={8}
              placeholder="Savollarni bu yerga joylashtiring..."
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleParseBulkQuestions}
                disabled={!bulkImportText.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Import qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
