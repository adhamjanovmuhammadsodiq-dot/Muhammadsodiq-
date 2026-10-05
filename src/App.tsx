import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { TestTakingView } from './components/TestTakingView.tsx';
import { TestResultView } from './components/TestResultView.tsx';
import { MySubmissionsView } from './components/MySubmissionsView.tsx';
import { MistakesBankView } from './components/MistakesBankView.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { StatsRatingView } from './components/StatsRatingView.tsx';
import { ApiClient } from './lib/api.ts';
import { ActiveTestDetails, Submission } from './types.ts';

const MainContent: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [currentView, setCurrentView] = useState<'tests' | 'results' | 'mistakes' | 'stats' | 'teacher'>('tests');
  const [activeTestTaking, setActiveTestTaking] = useState<ActiveTestDetails | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  // Start test
  const handleStartTest = async (testId: string) => {
    try {
      setLoadingTest(true);
      const testData = await ApiClient.getTestToTake(testId);
      setActiveSubmission(null);
      setActiveTestTaking(testData);
    } catch (err: any) {
      alert(err.message || 'Testni boshlashda xatolik yuz berdi.');
    } finally {
      setLoadingTest(false);
    }
  };

  // Start Blitz Arena Challenge
  const handleStartBlitz = async () => {
    try {
      setLoadingTest(true);
      const blitzData = await ApiClient.getBlitzChallenge();
      setActiveSubmission(null);
      setActiveTestTaking(blitzData);
    } catch (err: any) {
      alert(err.message || 'Blitz challenge yuklashda xatolik yuz berdi.');
    } finally {
      setLoadingTest(false);
    }
  };

  // Finish test
  const handleFinishTest = (submission: Submission) => {
    setActiveTestTaking(null);
    setActiveSubmission(submission);
  };

  // Retake test
  const handleRetake = () => {
    if (activeSubmission) {
      handleStartTest(activeSubmission.testId);
    }
  };

  // Back to catalog
  const handleBackToCatalog = () => {
    setActiveTestTaking(null);
    setActiveSubmission(null);
    setCurrentView('tests');
  };

  // If student is currently taking an exam:
  if (activeTestTaking) {
    return (
      <TestTakingView
        test={activeTestTaking}
        onFinish={handleFinishTest}
        onCancel={handleBackToCatalog}
      />
    );
  }

  // If student is viewing the result of a submitted test:
  if (activeSubmission) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1">
          <TestResultView
            submission={activeSubmission}
            onRetake={handleRetake}
            onBackToTests={handleBackToCatalog}
            onGoToMistakes={() => {
              setActiveSubmission(null);
              setCurrentView('mistakes');
            }}
          />
        </main>
        <Footer />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setActiveSubmission(null);
          setActiveTestTaking(null);
          setCurrentView(view);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loadingTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Test yuklanmoqda...
              </span>
            </div>
          </div>
        )}

        {currentView === 'tests' && (
          <StudentDashboard
            onStartTest={handleStartTest}
            onStartBlitz={handleStartBlitz}
            onGoToMistakes={() => setCurrentView('mistakes')}
          />
        )}

        {currentView === 'results' && (
          <MySubmissionsView
            onSelectSubmission={(sub) => setActiveSubmission(sub)}
            onGoToTests={() => setCurrentView('tests')}
          />
        )}

        {currentView === 'mistakes' && (
          <MistakesBankView onGoToTests={() => setCurrentView('tests')} />
        )}

        {currentView === 'stats' && (
          <StatsRatingView />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard />
        )}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
