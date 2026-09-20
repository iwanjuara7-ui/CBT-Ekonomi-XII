import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Participant, Question } from '../types';
import { EXAM_CONFIG } from '../data/questions';
import { QuestionCard } from './QuestionCard';
import { QuestionNav } from './QuestionNav';
import { ConfirmModal } from './ConfirmModal';
import { CountdownTimer } from './CountdownTimer';
import { LayoutGrid, X, Clock, Loader2, CheckCircle } from 'lucide-react';

interface ExamScreenProps {
  participant: Participant;
  questions: Question[];
  durationMinutes?: number;
  onFinishExam: (answers: Record<number, string>, timeSpentSeconds: number, reason: 'manual' | 'time') => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  participant,
  questions,
  durationMinutes = EXAM_CONFIG.durationMinutes,
  onFinishExam,
}) => {
  const totalDurationSeconds = durationMinutes * 60;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [doubts, setDoubts] = useState<Set<number>>(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(totalDurationSeconds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Keep a reference to latest answers so auto-submit has up-to-date data without resetting timers
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const isSubmittedRef = useRef(false);

  // Automatic submission triggered when countdown timer reaches zero
  const handleAutoSubmit = useCallback(() => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    setIsAutoSubmitting(true);
    setIsModalOpen(false);

    // Brief delay to allow student to see the auto-submission notice
    setTimeout(() => {
      onFinishExam(answersRef.current, totalDurationSeconds, 'time');
    }, 1200);
  }, [onFinishExam, totalDurationSeconds]);

  const currentQuestion = questions[currentIndex];

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
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if modal is open or submitted
      if (isModalOpen || isSubmittedRef.current) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        handleSelectOption(key);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (key === 'R') {
        handleToggleDoubt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handlePrev, handleNext, handleToggleDoubt, isModalOpen]);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const doubtCount = doubts.size;

  const handleConfirmSubmit = () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    const timeSpent = Math.max(1, totalDurationSeconds - remainingSeconds);
    setIsModalOpen(false);
    onFinishExam(answers, timeSpent, 'manual');
  };

  return (
    <div id="exam-screen" className="min-h-screen bg-slate-100/70 pb-12">
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

          {/* Status & Timer */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              id="exam-status"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              UJIAN BERLANGSUNG
            </span>

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
              questions={questions}
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
                totalQuestions={questions.length}
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
              questions={questions}
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
        totalCount={questions.length}
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
