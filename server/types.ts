export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  createdAt: number;
  lastLoginAt: number;
}

export interface OtpRecord {
  id: string;
  phone: string;
  code: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  expiresAt: number;
  used: boolean;
  attempts: number;
  telegramChatId?: string;
  createdAt: number;
}

export interface Session {
  token: string;
  userId: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  points: number;
}

export type PublicQuestion = Omit<Question, 'correctOption' | 'explanation'>;

export interface TestItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  grade: string;
  durationMinutes: number;
  passingScore: number; // e.g. 60 (percent)
  active: boolean;
  difficulty?: 'Oson' | 'O\'rta' | 'Qiyin';
  category?: 'DTM' | 'Olimpiada' | 'Sertifikat' | 'Umumiy';
  createdAt: number;
  createdBy: string;
  questions: Question[];
}

export type PublicTestItem = Omit<TestItem, 'questions'> & {
  questionsCount: number;
};

export interface QuestionResult {
  questionId: string;
  questionText: string;
  options: QuestionOption[];
  userAnswer?: 'A' | 'B' | 'C' | 'D';
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  isUnanswered: boolean;
  explanation: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface Submission {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  userId: string;
  studentName: string;
  studentPhone: string;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  passed: boolean;
  timeSpentSeconds: number;
  submittedAt: number;
  results?: QuestionResult[];
}
