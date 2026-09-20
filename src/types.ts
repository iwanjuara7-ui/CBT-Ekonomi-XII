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
}

export interface Participant {
  name: string;
  studentClass: string;
  token?: string;
}

export interface ExamSettings {
  kkm: number;
  durationMinutes: number;
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
}

export type AppScreen = 'identity' | 'rules' | 'exam' | 'result' | 'admin';
