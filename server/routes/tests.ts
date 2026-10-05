import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth, requireTeacherOrAdmin } from './auth.js';
import { QuestionResult, Submission, TestItem } from '../types.js';

export const testsRouter = Router();

// 1. Get active tests list (Public/Students)
testsRouter.get('/tests', async (req: Request, res: Response) => {
  try {
    const tests = db.getActiveTests();
    // Return summary without question answers
    const list = tests.map(t => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      description: t.description,
      grade: t.grade,
      durationMinutes: t.durationMinutes,
      passingScore: t.passingScore,
      questionsCount: t.questions.length,
      difficulty: t.difficulty || 'O\'rta',
      category: t.category || 'DTM',
      createdAt: t.createdAt
    }));

    res.json({ success: true, data: list });
  } catch (err: any) {
    console.error('[Tests] get error:', err);
    res.status(500).json({ success: false, message: 'Testlarni yuklashda xatolik.' });
  }
});

// 1.1 Get Blitz Challenge (Quick 5-question multi-subject rapid fire)
testsRouter.get('/blitz-challenge', optionalAuth, async (req: Request, res: Response) => {
  try {
    const tests = db.getActiveTests();
    const allQuestions: { testId: string; subject: string; question: any }[] = [];

    for (const t of tests) {
      for (const q of t.questions) {
        allQuestions.push({
          testId: t.id,
          subject: t.subject,
          question: {
            id: q.id,
            text: `[${t.subject}] ${q.text}`,
            options: q.options,
            points: 2
          }
        });
      }
    }

    // Shuffle and pick up to 5 questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    const blitzQuestions = shuffled.map(s => s.question);

    res.json({
      success: true,
      data: {
        id: 'blitz-arena-' + Date.now(),
        title: 'Tezkor Blitz Arena (Ekspress 5 savol)',
        subject: 'Aralash Fanlar',
        description: 'Barcha fanlar bo\'yicha 5 ta tasodifiy savol. O\'zingizni sinab ko\'ring!',
        grade: 'Umumiy reyting',
        durationMinutes: 5,
        passingScore: 60,
        questionsCount: blitzQuestions.length,
        difficulty: 'O\'rta',
        category: 'Olimpiada',
        questions: blitzQuestions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Blitz arena yuklashda xatolik.' });
  }
});

// 2. Start/Take test - SANITIZED questions (No answers leaked!) - open to solve
testsRouter.get('/tests/:id/take', optionalAuth, async (req: Request, res: Response) => {
  try {
    const test = db.getTestById(req.params.id);

    if (!test || !test.active) {
      res.status(404).json({ success: false, message: 'Test topilmadi yoki faol emas.' });
      return;
    }

    // SANITIZE: remove correctOption and explanation
    const sanitizedQuestions = test.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      points: q.points || 1
    }));

    res.json({
      success: true,
      data: {
        id: test.id,
        title: test.title,
        subject: test.subject,
        description: test.description,
        grade: test.grade,
        durationMinutes: test.durationMinutes,
        passingScore: test.passingScore,
        questionsCount: sanitizedQuestions.length,
        questions: sanitizedQuestions
      }
    });
  } catch (err: any) {
    console.error('[Tests] take error:', err);
    res.status(500).json({ success: false, message: 'Test ma\'lumotlarini olishda xatolik.' });
  }
});

// 3. Submit test answers - SERVER-SIDE EVALUATION - supports logged in and guests
testsRouter.post('/tests/:id/submit', optionalAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const test = db.getTestById(req.params.id);

    if (!test) {
      res.status(404).json({ success: false, message: 'Test topilmadi.' });
      return;
    }

    const { answers = {}, timeSpentSeconds = 0, guestName, guestPhone } = req.body;

    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const questionResults: QuestionResult[] = [];

    // Authoritative server-side evaluation against true answers
    for (const q of test.questions) {
      const qPoints = q.points || 1;
      totalPoints += qPoints;

      const userAnswer = answers[q.id];

      if (!userAnswer) {
        unansweredCount++;
        questionResults.push({
          questionId: q.id,
          questionText: q.text,
          options: q.options,
          correctOption: q.correctOption,
          isCorrect: false,
          isUnanswered: true,
          explanation: q.explanation,
          pointsEarned: 0,
          maxPoints: qPoints
        });
      } else if (userAnswer === q.correctOption) {
        correctCount++;
        earnedPoints += qPoints;
        questionResults.push({
          questionId: q.id,
          questionText: q.text,
          options: q.options,
          userAnswer,
          correctOption: q.correctOption,
          isCorrect: true,
          isUnanswered: false,
          explanation: q.explanation,
          pointsEarned: qPoints,
          maxPoints: qPoints
        });
      } else {
        incorrectCount++;
        questionResults.push({
          questionId: q.id,
          questionText: q.text,
          options: q.options,
          userAnswer,
          correctOption: q.correctOption,
          isCorrect: false,
          isUnanswered: false,
          explanation: q.explanation,
          pointsEarned: 0,
          maxPoints: qPoints
        });
      }
    }

    const totalQuestions = test.questions.length;
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= test.passingScore;

    const studentName = user ? `${user.firstName} ${user.lastName}`.trim() : (guestName || 'Mehmon O\'quvchi');
    const studentPhone = user ? user.phone : (guestPhone || 'Mehmon');
    const userId = user ? user.id : ('guest-' + Math.random().toString(36).substring(2, 9));

    const submission: Submission = {
      id: 'sub-' + Math.random().toString(36).substring(2, 10),
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      userId,
      studentName,
      studentPhone,
      userAnswers: answers,
      score: earnedPoints,
      maxScore: totalPoints,
      percentage,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      passed,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      submittedAt: Date.now(),
      results: questionResults
    };

    await db.saveSubmission(submission);

    res.json({
      success: true,
      message: 'Test muvaffaqiyatli yakunlandi va serverda tekshirildi!',
      data: submission
    });
  } catch (err: any) {
    console.error('[Tests] submit error:', err);
    res.status(500).json({ success: false, message: 'Natijalarni hisoblashda xatolik.' });
  }
});

// 4. Student's test submissions history
testsRouter.get('/my-submissions', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const list = db.getSubmissionsByUserId(user.id);
    res.json({ success: true, data: list });
  } catch (err: any) {
    console.error('[Tests] my-submissions error:', err);
    res.status(500).json({ success: false, message: 'Natijalar tarixini olishda xatolik.' });
  }
});

// 5. Get detailed submission review by ID
testsRouter.get('/submissions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const sub = db.getSubmissionById(req.params.id);

    if (!sub) {
      res.status(404).json({ success: false, message: 'Natija topilmadi.' });
      return;
    }

    // Only allow owner or teacher/admin
    if (sub.userId !== user.id && user.role !== 'admin' && user.role !== 'teacher') {
      res.status(403).json({ success: false, message: 'Ruxsat berilmagan.' });
      return;
    }

    res.json({ success: true, data: sub });
  } catch (err: any) {
    console.error('[Tests] get submission error:', err);
    res.status(500).json({ success: false, message: 'Ma\'lumotlarni olishda xatolik.' });
  }
});

// 5.1 Mistakes Bank (Questions student answered incorrectly)
testsRouter.get('/my-mistakes', optionalAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const submissions = user ? db.getSubmissionsByUserId(user.id) : [];

    const mistakesMap = new Map<string, any>();

    for (const sub of submissions) {
      if (sub.results) {
        for (const res of sub.results) {
          if (!res.isCorrect && !mistakesMap.has(res.questionId)) {
            mistakesMap.set(res.questionId, {
              testId: sub.testId,
              testTitle: sub.testTitle,
              subject: sub.subject,
              questionId: res.questionId,
              questionText: res.questionText,
              options: res.options,
              userAnswer: res.userAnswer,
              correctOption: res.correctOption,
              explanation: res.explanation,
              submittedAt: sub.submittedAt
            });
          }
        }
      }
    }

    res.json({ success: true, data: Array.from(mistakesMap.values()) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Xatoliklar bankini olishda xatolik.' });
  }
});

// ======================== TEACHER / ADMIN ROUTES ========================

// 6. Admin: Get all tests (including drafts and questions with answers)
testsRouter.get('/admin/tests', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const tests = db.getAllTests();
    res.json({ success: true, data: tests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Testlarni yuklashda xatolik.' });
  }
});

// 7. Admin: Create new test
testsRouter.post('/admin/tests', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, subject, description, grade, durationMinutes, passingScore, active, questions } = req.body;

    if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, message: 'Test sarlavhasi, fani va kamida 1 ta savol talab qilinadi.' });
      return;
    }

    // Format and validate questions
    const formattedQuestions = questions.map((q: any, idx: number) => ({
      id: q.id || `q-${Date.now()}-${idx + 1}`,
      text: q.text || '',
      options: q.options || [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      correctOption: q.correctOption || 'A',
      explanation: q.explanation || '',
      points: Number(q.points) || 1
    }));

    const newTest: TestItem = {
      id: 'test-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      subject: subject.trim(),
      description: description || '',
      grade: grade || 'Umumiy',
      durationMinutes: Number(durationMinutes) || 20,
      passingScore: Number(passingScore) || 60,
      active: active !== false,
      createdAt: Date.now(),
      createdBy: user.id,
      questions: formattedQuestions
    };

    const saved = await db.saveTest(newTest);
    res.json({ success: true, message: 'Test muvaffaqiyatli yaratildi!', data: saved });
  } catch (err: any) {
    console.error('[Admin] create test error:', err);
    res.status(500).json({ success: false, message: 'Test yaratishda server xatoligi.' });
  }
});

// 8. Admin: Update test
testsRouter.put('/admin/tests/:id', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const existing = db.getTestById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Test topilmadi.' });
      return;
    }

    const { title, subject, description, grade, durationMinutes, passingScore, active, questions } = req.body;

    const updated: TestItem = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      subject: subject !== undefined ? subject.trim() : existing.subject,
      description: description !== undefined ? description : existing.description,
      grade: grade !== undefined ? grade : existing.grade,
      durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : existing.durationMinutes,
      passingScore: passingScore !== undefined ? Number(passingScore) : existing.passingScore,
      active: active !== undefined ? Boolean(active) : existing.active,
      questions: Array.isArray(questions) ? questions : existing.questions
    };

    const saved = await db.saveTest(updated);
    res.json({ success: true, message: 'Test ma\'lumotlari yangilandi.', data: saved });
  } catch (err: any) {
    console.error('[Admin] update test error:', err);
    res.status(500).json({ success: false, message: 'Testni tahrirlashda xatolik.' });
  }
});

// 9. Admin: Delete test
testsRouter.delete('/admin/tests/:id', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteTest(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Test topilmadi.' });
      return;
    }
    res.json({ success: true, message: 'Test o\'chirildi.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'O\'chirishda xatolik.' });
  }
});

// 10. Admin: Get all student submissions with search & stats
testsRouter.get('/admin/submissions', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const submissions = db.getAllSubmissions();
    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Natijalarni olishda xatolik.' });
  }
});

// 11. Admin: Platform stats
testsRouter.get('/admin/stats', requireTeacherOrAdmin, async (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Statistikani olishda xatolik.' });
  }
});
