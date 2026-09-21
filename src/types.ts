export type CognitiveLevel = 'LOTS' | 'MOTS' | 'HOTS';

export interface Question {
  id: number;
  material: string;
  level: CognitiveLevel;
  text: string;
  options: string[];
  answer: string;
  discussion: string;
  active: boolean;
  image?: string;
}

export interface Participant {
  name: string;
  studentClass: string;
  token?: string;
}

export interface CheatViolation {
  timestamp: string;
  type: string;
  description: string;
}

export interface AntiCheatSettings {
  enabled: boolean;
  blockTabSwitch: boolean;
  enforceFullscreen: boolean;
  disableCopyPaste: boolean;
  disableRightClick: boolean;
  disableDevTools: boolean;
  maxViolations: number; // 0 = tanpa batas toleransi (hanya catat)
  actionOnMaxViolations: 'auto_submit' | 'warn_only';
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface ExamSettings {
  kkm: number;
  durationMinutes: number;
  antiCheat?: AntiCheatSettings;
}

export interface SchoolKopConfig {
  provinceOffice: string;
  schoolName: string;
  schoolAddress: string;
  academicYear: string;
  semester: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  reportCity: string;
  reportDate: string;
}

export interface SubmissionRecord {
  id: string;
  name: string;
  studentClass: string;
  token?: string;
  score: number;
  correct: number;
  wrong: number;
  unanswered: number;
  totalActive: number;
  submittedAt: string;
  answers: Record<number, string>;
  timeSpentSeconds?: number;
  violations?: CheatViolation[];
  violationCount?: number;
}

export type AppScreen = 'identity' | 'rules' | 'exam' | 'result' | 'admin';
