import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Participant, Question, AntiCheatSettings, CheatViolation } from '../types';
import { EXAM_CONFIG } from '../data/questions';
import { QuestionCard } from './QuestionCard';
import { QuestionNav } from './QuestionNav';
import { ConfirmModal } from './ConfirmModal';
import { CountdownTimer } from './CountdownTimer';
import { AntiCheatWarningModal } from './AntiCheatWarningModal';
import { prepareStudentQuestions, getViolationTimestamp } from '../utils/antiCheatHelper';
import { 
  LayoutGrid, X, Clock, Loader2, ShieldCheck, ShieldAlert, 
  Maximize2, Minimize2, AlertCircle 
} from 'lucide-react';

interface ExamScreenProps {
  participant: Participant;
  questions: Question[];
  durationMinutes?: number;
  antiCheat?: AntiCheatSettings;
  onFinishExam: (
    answers: Record<number, string>, 
    timeSpentSeconds: number, 
    reason: 'manual' | 'time' | 'violation',
    violations?: CheatViolation[]
  ) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  participant,
  questions,
  durationMinutes = EXAM_CONFIG.durationMinutes,
  antiCheat,
  onFinishExam,
}) => {
  const totalDurationSeconds = durationMinutes * 60;
  
  // Siapkan daftar soal (mendukung acak soal dan acak opsi jika diatur guru)
  const [processedQuestions] = useState<Question[]>(() => 
    prepareStudentQuestions(
      questions, 
      !!antiCheat?.randomizeQuestions, 
      !!antiCheat?.randomizeOptions
    )
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [doubts, setDoubts] = useState<Set<number>>(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Anti-Cheat states
  const [violations, setViolations] = useState<CheatViolation[]>([]);
  const [isAntiCheatWarningOpen, setIsAntiCheatWarningOpen] = useState(false);
  const [isForceSubmitting, setIsForceSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [antiCheatToast, setAntiCheatToast] = useState<string | null>(null);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const violationsRef = useRef(violations);
  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  const isSubmittedRef = useRef(false);
  const lastBlurTimestampRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setAntiCheatToast(msg);
    setTimeout(() => {
      setAntiCheatToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Handler submit otomatis jika waktu habis
  const handleAutoSubmit = useCallback(() => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    setIsAutoSubmitting(true);
    setIsModalOpen(false);
    setIsAntiCheatWarningOpen(false);

    setTimeout(() => {
      onFinishExam(answersRef.current, totalDurationSeconds, 'time', violationsRef.current);
    }, 1200);
  }, [onFinishExam, totalDurationSeconds]);

  // Handler force submit jika pelanggaran melebihi batas toleransi
  const handleViolationForceSubmit = useCallback(() => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    setIsForceSubmitting(true);
    setIsModalOpen(false);
    setIsAntiCheatWarningOpen(false);

    const timeSpent = Math.max(1, totalDurationSeconds - remainingSeconds);
    onFinishExam(answersRef.current, timeSpent, 'violation', violationsRef.current);
  }, [onFinishExam, remainingSeconds, totalDurationSeconds]);

  // Record a violation safely
  const recordViolation = useCallback((type: string, description: string) => {
    if (isSubmittedRef.current) return;

    const newViolation: CheatViolation = {
      timestamp: getViolationTimestamp(),
      type,
      description,
    };

    setViolations((prev) => {
      const updated = [...prev, newViolation];
      violationsRef.current = updated;
      const count = updated.length;
      const max = antiCheat?.maxViolations ?? 3;

      // Cek apakah mencapai batas maksimal toleransi
      if (max > 0 && count >= max && antiCheat?.actionOnMaxViolations === 'auto_submit') {
        setIsAntiCheatWarningOpen(true);
        // Delay 1.5 detik agar siswa membaca sebelum dikumpulkan
        setTimeout(() => {
          handleViolationForceSubmit();
        }, 2000);
      } else {
        setIsAntiCheatWarningOpen(true);
      }

      return updated;
    });
  }, [antiCheat?.maxViolations, antiCheat?.actionOnMaxViolations, handleViolationForceSubmit]);

  // ==========================================
  // ANTI-CHEAT LISTENERS: Tab Switching & Blur
  // ==========================================
  useEffect(() => {
    if (!antiCheat?.enabled || !antiCheat?.blockTabSwitch) return;

    const handleVisibilityChange = () => {
      if (isSubmittedRef.current) return;

      if (document.hidden) {
        // Debounce agar tidak dobel dalam waktu 1.5 detik
        const now = Date.now();
        if (now - lastBlurTimestampRef.current > 1500) {
          lastBlurTimestampRef.current = now;
          recordViolation(
            'Pindah Tab Browser',
            'Peserta beralih ke tab atau program lain di luar lembar ujian CBT.'
          );
        }
      }
    };

    const handleWindowBlur = () => {
      if (isSubmittedRef.current) return;
      const now = Date.now();
      if (now - lastBlurTimestampRef.current > 2000) {
        lastBlurTimestampRef.current = now;
        recordViolation(
          'Jendela Tidak Fokus (Blur)',
          'Kursor atau jendela ujian kehilangan fokus (membuka aplikasi lain).'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [antiCheat?.enabled, antiCheat?.blockTabSwitch, recordViolation]);

  // ==========================================
  // ANTI-CHEAT LISTENERS: Clipboard & Shortcuts
  // ==========================================
  useEffect(() => {
    if (!antiCheat?.enabled) return;

    const handleCopy = (e: ClipboardEvent) => {
      if (antiCheat.disableCopyPaste) {
        e.preventDefault();
        showToast('Penyalinan teks soal dinonaktifkan demi integritas ujian.');
        recordViolation('Mencoba Menyalin (Copy)', 'Peserta mencoba menyalin (copy) teks naskah soal.');
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (antiCheat.disableCopyPaste) {
        e.preventDefault();
        showToast('Fungsi Cut dinonaktifkan.');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (antiCheat.disableCopyPaste) {
        e.preventDefault();
        showToast('Fungsi Paste dinonaktifkan.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (antiCheat.disableRightClick) {
        e.preventDefault();
        showToast('Klik kanan dinonaktifkan selama ujian CBT berlangsung.');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut blokir devtools & print/save
      if (antiCheat.disableDevTools) {
        // F12
        if (e.key === 'F12') {
          e.preventDefault();
          showToast('Tombol F12 (Developer Tools) dinonaktifkan!');
          recordViolation('Membuka Developer Tools (F12)', 'Peserta mencoba menekan tombol F12 Inspect Element.');
          return;
        }

        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
          e.preventDefault();
          showToast('Inspect element dilarang!');
          recordViolation('Membuka Developer Tools', 'Peserta mencoba shortcut Inspect Element.');
          return;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
          e.preventDefault();
          showToast('Melihat source code dilarang.');
          recordViolation('View Page Source (Ctrl+U)', 'Peserta mencoba melihat source code halaman.');
          return;
        }

        // Ctrl+P (Print)
        if (e.ctrlKey && e.key.toUpperCase() === 'P') {
          e.preventDefault();
          showToast('Mencetak naskah soal dilarang.');
          return;
        }

        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key.toUpperCase() === 'S') {
          e.preventDefault();
          return;
        }
      }

      // Shortcut Copy/Paste jika disableCopyPaste
      if (antiCheat.disableCopyPaste && e.ctrlKey && ['C', 'V', 'X'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        showToast('Penyalinan naskah ujian dengan tombol pintas dilarang.');
        recordViolation(`Pintasan Ctrl+${e.key.toUpperCase()}`, 'Peserta mencoba menyalin/menempel teks menggunakan keyboard.');
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [antiCheat, recordViolation, showToast]);

  // ==========================================
  // FULLSCREEN MODE MANAGEMENT
  // ==========================================
  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          showToast('Perangkat/browser membatasi mode layar penuh.');
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    } catch {
      // fallback
    }
  }, [showToast]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);

      if (!inFullscreen && antiCheat?.enabled && antiCheat?.enforceFullscreen && !isSubmittedRef.current) {
        recordViolation(
          'Keluar dari Layar Penuh',
          'Peserta keluar dari mode tampilan layar penuh (Fullscreen) saat ujian aktif.'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [antiCheat?.enabled, antiCheat?.enforceFullscreen, recordViolation]);

  // Keyboard navigation for options (A-E, Left/Right, R for doubt)
  useEffect(() => {
    const handleNavigationKeys = (e: KeyboardEvent) => {
      if (isModalOpen || isAntiCheatWarningOpen || isSubmittedRef.current) return;
      // Jangan tangkap jika sedang menekan Ctrl/Alt
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const currentQ = processedQuestions[currentIndex];
      if (!currentQ) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        setAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(processedQuestions.length - 1, prev + 1));
      } else if (key === 'R') {
        setDoubts((prev) => {
          const next = new Set(prev);
          if (next.has(currentQ.id)) next.delete(currentQ.id);
          else next.add(currentQ.id);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleNavigationKeys);
    return () => window.removeEventListener('keydown', handleNavigationKeys);
  }, [isModalOpen, isAntiCheatWarningOpen, processedQuestions, currentIndex]);

  const currentQuestion = processedQuestions[currentIndex];

  const handleSelectOption = useCallback((key: string) => {
    if (!currentQuestion || isSubmittedRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  }, [currentQuestion]);

  const handleToggleDoubt = useCallback(() => {
    if (!currentQuestion || isSubmittedRef.current) return;
    setDoubts((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(processedQuestions.length - 1, prev + 1));
  }, [processedQuestions.length]);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = processedQuestions.length - answeredCount;
  const doubtCount = doubts.size;

  const handleConfirmSubmit = () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    const timeSpent = Math.max(1, totalDurationSeconds - remainingSeconds);
    setIsModalOpen(false);
    onFinishExam(answers, timeSpent, 'manual', violationsRef.current);
  };

  return (
    <div 
      id="exam-screen" 
      className={`min-h-screen bg-slate-100/70 pb-12 ${antiCheat?.disableCopyPaste ? 'select-none' : ''}`}
    >
      {/* Toast Peringatan Anti-Curang Singkat */}
      {antiCheatToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold border border-rose-500/50 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{antiCheatToast}</span>
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-extrabold text-[#0b2745] text-sm shadow-xs">
              CBT
            </div>
            <div>
              <strong id="exam-student-name" className="block text-sm font-bold text-slate-900 leading-tight">
                {participant.name}
              </strong>
              <span id="exam-student-class" className="block text-xs text-slate-500 font-medium">
                {participant.studentClass} · Ekonomi XII
              </span>
            </div>
          </div>

          {/* Anti-Cheat Badge & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {antiCheat?.enabled && (
              <div 
                title="Sistem Pengawas Ujian CBT Aktif"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  violations.length > 0 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {violations.length > 0 ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>{violations.length} Pelanggaran</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Anti-Curang Aktif</span>
                  </>
                )}
              </div>
            )}

            {/* Toggle Fullscreen button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Dedicated Countdown Timer Component */}
            <CountdownTimer
              totalSeconds={totalDurationSeconds}
              onTimeExpired={handleAutoSubmit}
              onTick={setRemainingSeconds}
              isSubmitted={isSubmitted}
            />

            {/* Mobile Nav Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Buka navigasi soal"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Mobile Navigation Drawer / Collapsible */}
        {isMobileNavOpen && (
          <div className="md:hidden mb-4 animate-in slide-in-from-top-2 duration-200">
            <QuestionNav
              questions={processedQuestions}
              currentIndex={currentIndex}
              answers={answers}
              doubts={doubts}
              onSelect={(index) => {
                setCurrentIndex(index);
                setIsMobileNavOpen(false);
              }}
              isMobileDrawer
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Question Card (Left / Main) */}
          <div className="md:col-span-8 lg:col-span-9">
            {currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                isDoubt={doubts.has(currentQuestion.id)}
                currentIndex={currentIndex}
                totalQuestions={processedQuestions.length}
                textSize={textSize}
                onChangeTextSize={setTextSize}
                onSelectOption={handleSelectOption}
                onToggleDoubt={handleToggleDoubt}
                onPrev={handlePrev}
                onNext={handleNext}
                onOpenFinishModal={() => setIsModalOpen(true)}
              />
            ) : null}
          </div>

          {/* Question Navigation Grid (Right / Desktop) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <QuestionNav
              questions={processedQuestions}
              currentIndex={currentIndex}
              answers={answers}
              doubts={doubts}
              onSelect={setCurrentIndex}
            />
          </div>
        </div>
      </main>

      {/* Confirm Finish Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        doubtCount={doubtCount}
        totalCount={processedQuestions.length}
      />

      {/* Anti-Cheat Warning Modal */}
      <AntiCheatWarningModal
        isOpen={isAntiCheatWarningOpen}
        onClose={() => setIsAntiCheatWarningOpen(false)}
        violations={violations}
        maxViolations={antiCheat?.maxViolations ?? 3}
        isForceSubmitting={isForceSubmitting}
        onForceSubmitNow={handleViolationForceSubmit}
      />

      {/* Automatic Submission Modal upon Time Expiry */}
      {isAutoSubmitting && (
        <div
          id="auto-submit-overlay"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Waktu Ujian Telah Berakhir!
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Batas waktu asesmen ({durationMinutes} menit) telah habis. Sistem sedang menyimpan dan mengumpulkan seluruh jawaban Anda secara otomatis.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Menyimpan Lembar Jawaban CBT...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
