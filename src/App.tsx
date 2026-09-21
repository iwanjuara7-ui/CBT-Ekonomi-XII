import React, { useState, useEffect } from 'react';
import { AppScreen, Participant, Question, SubmissionRecord, ExamSettings, AntiCheatSettings, CheatViolation } from './types';
import { INITIAL_QUESTIONS, generateRandomToken } from './data/questions';
import { StudentLogin } from './components/StudentLogin';
import { RulesScreen } from './components/RulesScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { getStoredSheetsConfig, sendSubmissionToSheets } from './utils/googleSheetsService';

const STORAGE_SUBMISSIONS_KEY = 'cbt_ekonomi_xii_submissions';
const STORAGE_QUESTIONS_KEY = 'cbt_ekonomi_xii_questions_v3';
const STORAGE_SETTINGS_KEY = 'cbt_ekonomi_xii_exam_settings_v1';

export const DEFAULT_ANTI_CHEAT: AntiCheatSettings = {
  enabled: true,
  blockTabSwitch: true,
  enforceFullscreen: false,
  disableCopyPaste: true,
  disableRightClick: true,
  disableDevTools: true,
  maxViolations: 3,
  actionOnMaxViolations: 'auto_submit',
  randomizeQuestions: false,
  randomizeOptions: false,
};

const DEFAULT_SETTINGS: ExamSettings = {
  kkm: 75,
  durationMinutes: 30,
  antiCheat: DEFAULT_ANTI_CHEAT,
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('identity');
  const [participant, setParticipant] = useState<Participant>({ name: '', studentClass: '' });
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY);
      if (saved) {
        const parsed: Question[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_QUESTIONS;
  });

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy sample / dummy submissions
          return parsed.filter(
            (p: SubmissionRecord) =>
              !p.id?.startsWith('sample-') &&
              p.name !== 'Siti Rahmadani' &&
              p.name !== 'Ahmad Faisal' &&
              p.name !== 'Dewi Lestari'
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [latestSubmission, setLatestSubmission] = useState<SubmissionRecord | null>(null);
  const [finishReason, setFinishReason] = useState<'manual' | 'time' | 'violation'>('manual');

  // Dynamic Exam Settings (KKM, Time Duration, and Anti-Cheat)
  const [examSettings, setExamSettings] = useState<ExamSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.kkm === 'number' && typeof parsed?.durationMinutes === 'number') {
          return {
            kkm: Math.max(10, Math.min(100, Math.round(parsed.kkm))),
            durationMinutes: Math.max(5, Math.min(240, Math.round(parsed.durationMinutes))),
            antiCheat: { ...DEFAULT_ANTI_CHEAT, ...(parsed.antiCheat || {}) },
          };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Sync submissions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch {
      // ignore
    }
  }, [submissions]);

  // Sync questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  // Sync exam settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(examSettings));
    } catch {
      // ignore
    }
  }, [examSettings]);

  const activeQuestions = questions.filter((q) => q.active);
  const draftCount = questions.length - activeQuestions.length;

  const handleStudentSubmit = (data: Participant) => {
    const randomToken = generateRandomToken();
    setParticipant({
      ...data,
      token: randomToken,
    });
    setScreen('rules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = (confirmedToken: string) => {
    setParticipant((prev) => ({
      ...prev,
      token: confirmedToken,
    }));
    setScreen('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishExam = (
    answers: Record<number, string>,
    timeSpentSeconds: number,
    reason: 'manual' | 'time' | 'violation',
    violations?: CheatViolation[]
  ) => {
    const totalActive = activeQuestions.length;
    let correct = 0;
    let answered = 0;

    activeQuestions.forEach((q) => {
      const studentChoice = answers[q.id];
      if (studentChoice) {
        answered++;
        if (studentChoice === q.answer) {
          correct++;
        }
      }
    });

    const wrong = answered - correct;
    const unanswered = totalActive - answered;
    const score = totalActive > 0 ? Math.round((correct / totalActive) * 100) : 0;

    const newRecord: SubmissionRecord = {
      id: Date.now().toString(),
      name: participant.name,
      studentClass: participant.studentClass,
      token: participant.token,
      score,
      correct,
      wrong,
      unanswered,
      totalActive,
      submittedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      answers,
      timeSpentSeconds,
      violations: violations || [],
      violationCount: violations?.length || 0,
    };

    setSubmissions((prev) => [newRecord, ...prev]);
    setLatestSubmission(newRecord);
    setFinishReason(reason);

    // Auto-sync to Google Sheets if configured
    try {
      const sheetsConfig = getStoredSheetsConfig();
      if (sheetsConfig.webAppUrl && sheetsConfig.autoSyncSubmissions) {
        sendSubmissionToSheets(newRecord, examSettings.kkm, sheetsConfig.webAppUrl)
          .catch((err) => console.error('Auto sync to sheets error:', err));
      }
    } catch {
      // ignore
    }

    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmissionsImported = (imported: SubmissionRecord[]) => {
    if (!Array.isArray(imported) || imported.length === 0) return;
    setSubmissions((prev) => {
      // Merge unique by id or token+name
      const existingTokens = new Set(prev.map((p) => p.token));
      const fresh = imported.filter((item) => !existingTokens.has(item.token));
      return [...fresh, ...prev];
    });
  };

  const handleRestart = () => {
    setParticipant({ name: '', studentClass: '' });
    setLatestSubmission(null);
    setScreen('identity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setScreen('identity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleQuestionActive = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q))
    );
  };

  const handleActivateAllQuestions = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, active: true })));
  };

  const handleImportQuestions = (imported: Question[], mode: 'append' | 'replace') => {
    if (!Array.isArray(imported) || imported.length === 0) return;
    if (mode === 'replace') {
      const reindexed = imported.map((q, idx) => ({ ...q, id: idx + 1 }));
      setQuestions(reindexed);
    } else {
      setQuestions((prev) => {
        const startId = prev.length + 1;
        const reindexedNew = imported.map((q, idx) => ({ ...q, id: startId + idx }));
        return [...prev, ...reindexedNew];
      });
    }
  };

  const handleResetQuestions = () => {
    setQuestions(INITIAL_QUESTIONS);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions((prev) => {
      const remaining = prev.filter((q) => q.id !== id);
      return remaining.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
  };

  const handleClearSubmissions = () => {
    if (window.confirm('Hapus seluruh riwayat rekap nilai siswa pada sesi ini?')) {
      setSubmissions([]);
    }
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[#f4f7fa]">
      {screen === 'identity' && (
        <StudentLogin
          onStudentSubmit={handleStudentSubmit}
          onOpenAdmin={() => {
            setScreen('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {screen === 'rules' && (
        <RulesScreen
          participant={participant}
          activeCount={activeQuestions.length}
          totalCount={questions.length}
          durationMinutes={examSettings.durationMinutes}
          kkm={examSettings.kkm}
          antiCheat={examSettings.antiCheat}
          onBack={() => setScreen('identity')}
          onStartExam={handleStartExam}
        />
      )}

      {screen === 'exam' && (
        <ExamScreen
          participant={participant}
          questions={activeQuestions}
          durationMinutes={examSettings.durationMinutes}
          antiCheat={examSettings.antiCheat}
          onFinishExam={handleFinishExam}
        />
      )}

      {screen === 'result' && latestSubmission && (
        <ResultScreen
          participant={participant}
          submission={latestSubmission}
          activeQuestions={activeQuestions}
          totalDraftCount={draftCount}
          durationMinutes={examSettings.durationMinutes}
          kkm={examSettings.kkm}
          reason={finishReason}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}

      {screen === 'admin' && (
        <TeacherDashboard
          submissions={submissions}
          questions={questions}
          examSettings={examSettings}
          onUpdateSettings={setExamSettings}
          onSubmissionsImported={handleSubmissionsImported}
          onToggleQuestionActive={handleToggleQuestionActive}
          onActivateAllQuestions={handleActivateAllQuestions}
          onImportQuestions={handleImportQuestions}
          onResetQuestions={handleResetQuestions}
          onDeleteQuestion={handleDeleteQuestion}
          onClearSubmissions={handleClearSubmissions}
          onDeleteSubmission={handleDeleteSubmission}
          onLogout={() => {
            setScreen('identity');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
