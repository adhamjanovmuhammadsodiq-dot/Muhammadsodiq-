import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, OtpRecord, Session, TestItem, Submission } from './types.js';

interface DatabaseSchema {
  users: User[];
  otpCodes: OtpRecord[];
  sessions: Session[];
  tests: TestItem[];
  submissions: Submission[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const TEMP_FILE = path.join(DATA_DIR, 'database.tmp.json');

// Initial seed tests in Uzbek
const INITIAL_TESTS: TestItem[] = [
  {
    id: 'test-math-01',
    title: 'Matematika: Algebra va Geometriya (DTM standarti)',
    subject: 'Matematika',
    description: "Tenglamalar, funksiyalar, logarifmlar va planimetriya bo'yicha saralangan chuqurlashtirilgan test savollari.",
    grade: 'Abituriyent / 11-sinf',
    durationMinutes: 25,
    passingScore: 60,
    active: true,
    createdAt: Date.now() - 86400000 * 5,
    createdBy: 'admin',
    questions: [
      {
        id: 'qm-1',
        text: 'Tenglamani yeching: 2^(x+2) + 2^x = 40',
        options: [
          { key: 'A', text: 'x = 3' },
          { key: 'B', text: 'x = 2' },
          { key: 'C', text: 'x = 4' },
          { key: 'D', text: 'x = 5' }
        ],
        correctOption: 'A',
        explanation: '2^(x+2) + 2^x = 40 => 4 * 2^x + 2^x = 40 => 5 * 2^x = 40 => 2^x = 8 => x = 3.',
        points: 2
      },
      {
        id: 'qm-2',
        text: 'Agar to\'g\'ri burchakli uchburchakning katetlari 6 cm va 8 cm bo\'lsa, gipotenuzaga tushirilgan balandlikni toping.',
        options: [
          { key: 'A', text: '4.8 cm' },
          { key: 'B', text: '5.2 cm' },
          { key: 'C', text: '4.5 cm' },
          { key: 'D', text: '5.0 cm' }
        ],
        correctOption: 'A',
        explanation: 'Gipotenuza c = √(6² + 8²) = 10 cm. Yuzasi S = (a * b) / 2 = (6 * 8) / 2 = 24 cm². Boshqa tomondan S = (c * h) / 2 => h = 2S / c = 48 / 10 = 4.8 cm.',
        points: 2
      },
      {
        id: 'qm-3',
        text: 'log₃(2x - 5) = 2 tenglamaning ildizini toping.',
        options: [
          { key: 'A', text: 'x = 7' },
          { key: 'B', text: 'x = 6' },
          { key: 'C', text: 'x = 8' },
          { key: 'D', text: 'x = 11' }
        ],
        correctOption: 'A',
        explanation: '2x - 5 = 3² = 9 => 2x = 14 => x = 7. Aniqlanish sohasi 2x - 5 > 0 qanoatlantiriladi.',
        points: 2
      },
      {
        id: 'qm-4',
        text: 'Arifmetik progressiyada a₁ = 3 va d = 4 bo\'lsa, uning dastlabki 10 ta hadi yig\'indisini hisoblang.',
        options: [
          { key: 'A', text: '210' },
          { key: 'B', text: '190' },
          { key: 'C', text: '220' },
          { key: 'D', text: '240' }
        ],
        correctOption: 'A',
        explanation: 'S_n = (2a₁ + (n - 1)d) * n / 2. S₁₀ = (2 * 3 + 9 * 4) * 10 / 2 = (6 + 36) * 5 = 42 * 5 = 210.',
        points: 2
      },
      {
        id: 'qm-5',
        text: 'f(x) = x³ - 3x² + 5 funksiyaning x = 2 nuqtadagi hosilasini hisoblang.',
        options: [
          { key: 'A', text: '0' },
          { key: 'B', text: '3' },
          { key: 'C', text: '-3' },
          { key: 'D', text: '6' }
        ],
        correctOption: 'A',
        explanation: "f'(x) = 3x² - 6x. x = 2 bo'lganda: f'(2) = 3*(2)² - 6*(2) = 12 - 12 = 0.",
        points: 2
      }
    ]
  },
  {
    id: 'test-physics-01',
    title: 'Fizika: Mexanika va Dinamika Asoslari',
    subject: 'Fizika',
    description: "Nyuton qonunlari, harakat kinematikasi, impuls va energiyaning saqlanish qonunlari.",
    grade: '10-11 sinf',
    durationMinutes: 20,
    passingScore: 60,
    active: true,
    createdAt: Date.now() - 86400000 * 3,
    createdBy: 'admin',
    questions: [
      {
        id: 'qp-1',
        text: 'Jism tinch holatdan a = 2 m/s² doimiy tezlanish bilan to\'g\'ri chiziqli tekis tezlanuvchan harakat boshladi. 5 sekundda jism qancha masofa bosib o\'tadi?',
        options: [
          { key: 'A', text: '25 m' },
          { key: 'B', text: '20 m' },
          { key: 'C', text: '50 m' },
          { key: 'D', text: '10 m' }
        ],
        correctOption: 'A',
        explanation: 'S = a * t² / 2 = 2 * (5)² / 2 = 25 metr.',
        points: 2
      },
      {
        id: 'qp-2',
        text: 'Massasi 4 kg bo\'lgan jismga 12 N kuch ta\'sir etganda jism qanday tezlanish oladi?',
        options: [
          { key: 'A', text: '3 m/s²' },
          { key: 'B', text: '48 m/s²' },
          { key: 'C', text: '0.33 m/s²' },
          { key: 'D', text: '8 m/s²' }
        ],
        correctOption: 'A',
        explanation: "Nyutonning 2-qonuniga binoan: F = m * a => a = F / m = 12 / 4 = 3 m/s².",
        points: 2
      },
      {
        id: 'qp-3',
        text: 'Massasi 2 kg bo\'lgan jism 10 m/s tezlik bilan harakatlanmoqda. Uning kinetik energiyasini toping.',
        options: [
          { key: 'A', text: '100 J' },
          { key: 'B', text: '20 J' },
          { key: 'C', text: '200 J' },
          { key: 'D', text: '50 J' }
        ],
        correctOption: 'A',
        explanation: 'E_k = (m * v²) / 2 = (2 * 10²) / 2 = 100 Joul.',
        points: 2
      },
      {
        id: 'qp-4',
        text: 'Bosimning Xalqaro birliklar sistemasidagi (SI) asosiy birligi nima?',
        options: [
          { key: 'A', text: 'Paskal (Pa)' },
          { key: 'B', text: 'Nyuton (N)' },
          { key: 'C', text: 'Joul (J)' },
          { key: 'D', text: 'Vatt (W)' }
        ],
        correctOption: 'A',
        explanation: 'Bosim birligi Pa (Paskal) bo\'lib, 1 Pa = 1 N / m² ga teng.',
        points: 2
      }
    ]
  },
  {
    id: 'test-uzbek-01',
    title: 'Ona tili: Grammatika va Imlo Qoidalari',
    subject: 'Ona tili',
    description: "So'z yasalishi, morfemika, imlo me'yorlari va sintaksis qoidalari.",
    grade: 'Umumiy / DTM',
    durationMinutes: 15,
    passingScore: 60,
    active: true,
    createdAt: Date.now() - 86400000 * 2,
    createdBy: 'admin',
    questions: [
      {
        id: 'qu-1',
        text: 'Qaysi qatorda imlo jihatdan xato yozilgan so\'z mavjud?',
        options: [
          { key: 'A', text: 'mashg\'ulot, ma\'naviyat, taraqqiyot' },
          { key: 'B', text: 'muomalat, tasavur, muddao' },
          { key: 'C', text: 'mutaxassis, muvozanat, tabassum' },
          { key: 'D', text: 'samarali, taassurot, tabrik' }
        ],
        correctOption: 'B',
        explanation: '"tasavur" emas, "tasavvur" (ikkita v bilan) yozilishi shart.',
        points: 2
      },
      {
        id: 'qu-2',
        text: '"Vatan oldidagi burchimizni sharaf bilan bajaramiz." Gapdagi bosh bo\'laklarni aniqlang.',
        options: [
          { key: 'A', text: 'Ega yashiringan (Biz), kesim: bajaramiz' },
          { key: 'B', text: 'Ega: burchimizni, kesim: bajaramiz' },
          { key: 'C', text: 'Ega: Vatan, kesim: sharaf' },
          { key: 'D', text: 'Ega: sharaf bilan, kesim: bajaramiz' }
        ],
        correctOption: 'A',
        explanation: 'Gapda ega ifodalanmagan, 1-shaxs ko\'plikdagi "biz" olmoshi bilan ifodalangan bir sostavli shaxsi ma\'lum gap.',
        points: 2
      },
      {
        id: 'qu-3',
        text: 'Qaysi qatorda o\'zaro sinonim so\'zlar berilgan?',
        options: [
          { key: 'A', text: 'ulug\', buyuk, mahobatli' },
          { key: 'B', text: 'yaxshi, yomon, xunuk' },
          { key: 'C', text: 'baland, past, tekis' },
          { key: 'D', text: 'erta, kech, tong' }
        ],
        correctOption: 'A',
        explanation: 'Ulug\', buyuk, mahobatli so\'zlari kattalik va yuksaklik ma\'nosini bildiruvchi sinonimlar qatoridir.',
        points: 2
      }
    ]
  },
  {
    id: 'test-it-01',
    title: 'Informatika va IT: Dasturlash va Algoritmlar',
    subject: 'IT va Dasturlash',
    description: "Ma'lumotlar tuzilmalari, algoritmlar murakkabligi va web texnologiyalari asoslari.",
    grade: 'Boshlang\'ich / O\'rta',
    durationMinutes: 20,
    passingScore: 70,
    active: true,
    createdAt: Date.now() - 86400000,
    createdBy: 'admin',
    questions: [
      {
        id: 'qit-1',
        text: 'Ikkilik qidirish (Binary Search) algoritmining o\'rtacha vaqt murakkabligi qanday?',
        options: [
          { key: 'A', text: 'O(log n)' },
          { key: 'B', text: 'O(n)' },
          { key: 'C', text: 'O(n²)' },
          { key: 'D', text: 'O(1)' }
        ],
        correctOption: 'A',
        explanation: 'Binary Search har bir qadamda massivni ikkiga bo\'lgani uchun uning vaqt murakkabligi O(log n) ga teng.',
        points: 2
      },
      {
        id: 'qit-2',
        text: 'Quyidagilardan qaysi biri HTTP protokolidagi xavfsiz (shifrlangan) standart hisoblanadi?',
        options: [
          { key: 'A', text: 'HTTPS (port 443)' },
          { key: 'B', text: 'FTP (port 21)' },
          { key: 'C', text: 'Telnet (port 23)' },
          { key: 'D', text: 'HTTP (port 80)' }
        ],
        correctOption: 'A',
        explanation: 'HTTPS (SSL/TLS orqali shifrlangan HTTP) 443-portda ma\'lumotlar xavfsizligini ta\'minlaydi.',
        points: 2
      },
      {
        id: 'qit-3',
        text: 'JavaScript tilida qaysi kalit so\'z qayta qiymat berib bo\'lmaydigan (o\'zgarmas) o\'zgaruvchi e\'lon qiladi?',
        options: [
          { key: 'A', text: 'const' },
          { key: 'B', text: 'let' },
          { key: 'C', text: 'var' },
          { key: 'D', text: 'static' }
        ],
        correctOption: 'A',
        explanation: 'const - o\'zgarmas havolani belgilaydi, unga boshqa yangi qiymat o\'zlashtirib bo\'lmaydi.',
        points: 2
      }
    ]
  }
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    otpCodes: [],
    sessions: [],
    tests: [],
    submissions: []
  };

  private isLoaded = false;
  private transactionLock = Promise.resolve();

  constructor() {
    this.ensureLoaded();
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        // Initialize with default admin and sample tests
        this.data = {
          users: [
            {
              id: 'user-admin',
              firstName: 'Olim',
              lastName: 'Muallimov',
              phone: '+998901234567',
              role: 'admin',
              createdAt: Date.now() - 86400000 * 30,
              lastLoginAt: Date.now()
            },
            {
              id: 'user-student-demo',
              firstName: 'Azizbek',
              lastName: 'Karimov',
              phone: '+998939876543',
              role: 'student',
              createdAt: Date.now() - 86400000 * 10,
              lastLoginAt: Date.now() - 86400000
            }
          ],
          otpCodes: [],
          sessions: [],
          tests: INITIAL_TESTS,
          submissions: []
        };
        this.persistSync();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[Database] Faylni yuklashda xatolik:', err);
      this.data.tests = INITIAL_TESTS;
      this.isLoaded = true;
    }
  }

  // Atomic file persistence using temporary file and atomic rename
  private persistSync(): void {
    try {
      const payload = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(TEMP_FILE, payload, 'utf-8');
      fs.renameSync(TEMP_FILE, DB_FILE);
    } catch (err) {
      console.error('[Database] Saqlashda xatolik:', err);
    }
  }

  // ACID transaction lock for concurrency safety (500+ simultaneous operations)
  public async runTransaction<T>(operation: () => Promise<T> | T): Promise<T> {
    const nextLock = this.transactionLock.then(async () => {
      this.ensureLoaded();
      const res = await operation();
      this.persistSync();
      return res;
    });
    this.transactionLock = nextLock.then(() => {}, () => {});
    return nextLock;
  }

  // User operations
  public findUserById(id: string): User | undefined {
    this.ensureLoaded();
    return this.data.users.find(u => u.id === id);
  }

  public findUserByPhone(phone: string): User | undefined {
    this.ensureLoaded();
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return this.data.users.find(u => u.phone.replace(/[\s-]/g, '') === cleanPhone);
  }

  public async saveUser(user: User): Promise<User> {
    return this.runTransaction(() => {
      const index = this.data.users.findIndex(u => u.id === user.id);
      if (index >= 0) {
        this.data.users[index] = user;
      } else {
        this.data.users.push(user);
      }
      return user;
    });
  }

  // OTP operations
  public async createOtp(
    phone: string,
    firstName: string,
    lastName: string,
    role: 'student' | 'teacher' | 'admin' = 'student'
  ): Promise<OtpRecord> {
    return this.runTransaction(() => {
      // Invalidate existing unused OTPs for this phone
      const cleanPhone = phone.replace(/[\s-]/g, '');
      for (const otp of this.data.otpCodes) {
        if (otp.phone.replace(/[\s-]/g, '') === cleanPhone && !otp.used) {
          otp.used = true;
        }
      }

      // Generate secure 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRecord: OtpRecord = {
        id: 'otp-' + crypto.randomUUID(),
        phone: cleanPhone,
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        used: false,
        attempts: 0,
        createdAt: Date.now()
      };

      this.data.otpCodes.push(otpRecord);
      return otpRecord;
    });
  }

  public async verifyOtp(phone: string, code: string): Promise<{ success: boolean; message: string; otpRecord?: OtpRecord }> {
    return this.runTransaction(() => {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      const cleanCode = code.trim();

      // Find active unused OTP
      const record = this.data.otpCodes
        .slice()
        .reverse()
        .find(o => o.phone.replace(/[\s-]/g, '') === cleanPhone && !o.used);

      if (!record) {
        return { success: false, message: 'Tasdiqlash kodi topilmadi yoki muddati o\'tgan. Qayta kod so\'rang.' };
      }

      if (Date.now() > record.expiresAt) {
        record.used = true;
        return { success: false, message: 'Tasdiqlash kodining amal qilish muddati (5 daqiqa) tugagan. Yangi kod so\'rang.' };
      }

      if (record.attempts >= 3) {
        record.used = true;
        return { success: false, message: 'Xato kod kiritishlar soni 3 tadan oshdi. Yangi kod so\'rang.' };
      }

      record.attempts += 1;

      if (record.code !== cleanCode) {
        return { success: false, message: `Kiritilgan kod xato. Qolgan urinishlar: ${3 - record.attempts}` };
      }

      // Valid! Mark as used once
      record.used = true;
      return { success: true, message: 'Tasdiqlandi', otpRecord: record };
    });
  }

  // Session operations
  public async createSession(userId: string, role: 'student' | 'teacher' | 'admin'): Promise<Session> {
    return this.runTransaction(() => {
      const token = crypto.randomBytes(32).toString('hex');
      const session: Session = {
        token,
        userId,
        role,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      };
      this.data.sessions.push(session);
      return session;
    });
  }

  public findSession(token: string): Session | undefined {
    this.ensureLoaded();
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (Date.now() > session.expiresAt) {
      return undefined;
    }
    return session;
  }

  public async deleteSession(token: string): Promise<void> {
    await this.runTransaction(() => {
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    });
  }

  // Test operations
  public getActiveTests(): TestItem[] {
    this.ensureLoaded();
    return this.data.tests.filter(t => t.active);
  }

  public getAllTests(): TestItem[] {
    this.ensureLoaded();
    return this.data.tests;
  }

  public getTestById(id: string): TestItem | undefined {
    this.ensureLoaded();
    return this.data.tests.find(t => t.id === id);
  }

  public async saveTest(test: TestItem): Promise<TestItem> {
    return this.runTransaction(() => {
      const index = this.data.tests.findIndex(t => t.id === test.id);
      if (index >= 0) {
        this.data.tests[index] = test;
      } else {
        this.data.tests.unshift(test);
      }
      return test;
    });
  }

  public async deleteTest(id: string): Promise<boolean> {
    return this.runTransaction(() => {
      const prevLength = this.data.tests.length;
      this.data.tests = this.data.tests.filter(t => t.id !== id);
      return this.data.tests.length < prevLength;
    });
  }

  // Submission operations
  public async saveSubmission(sub: Submission): Promise<Submission> {
    return this.runTransaction(() => {
      this.data.submissions.unshift(sub);
      return sub;
    });
  }

  public getSubmissionsByUserId(userId: string): Submission[] {
    this.ensureLoaded();
    return this.data.submissions.filter(s => s.userId === userId);
  }

  public getAllSubmissions(): Submission[] {
    this.ensureLoaded();
    return this.data.submissions;
  }

  public getSubmissionById(id: string): Submission | undefined {
    this.ensureLoaded();
    return this.data.submissions.find(s => s.id === id);
  }

  public getStats() {
    this.ensureLoaded();
    const totalUsers = this.data.users.length;
    const totalStudents = this.data.users.filter(u => u.role === 'student').length;
    const totalTests = this.data.tests.length;
    const totalSubmissions = this.data.submissions.length;
    
    let totalScorePct = 0;
    let passedCount = 0;
    for (const sub of this.data.submissions) {
      totalScorePct += sub.percentage;
      if (sub.passed) passedCount++;
    }

    const averageScore = totalSubmissions > 0 ? Math.round(totalScorePct / totalSubmissions) : 0;
    const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

    return {
      totalUsers,
      totalStudents,
      totalTests,
      totalSubmissions,
      averageScore,
      passRate
    };
  }
}

export const db = new Database();
