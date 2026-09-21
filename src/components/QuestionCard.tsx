import React from 'react';
import { Question } from '../types';
import { FormattedContent } from './FormattedContent';
import { ArrowLeft, ArrowRight, Flag, Send, Type } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  isDoubt: boolean;
  currentIndex: number;
  totalQuestions: number;
  textSize: 'sm' | 'base' | 'lg';
  onChangeTextSize: (size: 'sm' | 'base' | 'lg') => void;
  onSelectOption: (optionKey: string) => void;
  onToggleDoubt: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenFinishModal: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  isDoubt,
  currentIndex,
  totalQuestions,
  textSize,
  onChangeTextSize,
  onSelectOption,
  onToggleDoubt,
  onPrev,
  onNext,
  onOpenFinishModal,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const fontClass = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
  }[textSize];

  const optionFontClass = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[textSize];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'HOTS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MOTS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 md:p-8 shadow-sm flex flex-col justify-between min-h-[580px]">
      <div>
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
              Soal Nomor {currentIndex + 1}
            </span>
            <span className="text-slate-400 text-xs">/ {totalQuestions}</span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              (Dokumen No. {question.id})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Cognitive Level Pill */}
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold tracking-wide ${getLevelBadge(question.level)}`}>
              {question.level}
            </span>

            {/* Material Tag */}
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium truncate max-w-[210px]">
              {question.material}
            </span>

            {/* Text Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg ml-1">
              <button
                type="button"
                title="Ukuran Teks Kecil"
                onClick={() => onChangeTextSize('sm')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  textSize === 'sm' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                title="Ukuran Teks Sedang"
                onClick={() => onChangeTextSize('base')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  textSize === 'base' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                A
              </button>
              <button
                type="button"
                title="Ukuran Teks Besar"
                onClick={() => onChangeTextSize('lg')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded ${
                  textSize === 'lg' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="py-6">
          <div className={`font-semibold text-slate-900 ${fontClass}`}>
            <FormattedContent content={question.text} image={question.image} />
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3 mt-2" role="radiogroup" aria-label={`Pilihan jawaban soal nomor ${currentIndex + 1}`}>
          {question.options.map((option, idx) => {
            const key = String.fromCharCode(65 + idx); // A, B, C, D, E
            const isSelected = selectedAnswer === key;

            return (
              <label
                key={key}
                className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={key}
                  checked={isSelected}
                  onChange={() => onSelectOption(key)}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer shrink-0"
                />
                <div className="flex gap-2 flex-1">
                  <span className={`font-bold shrink-0 ${isSelected ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {key}.
                  </span>
                  <div className={`font-medium leading-relaxed flex-1 ${optionFontClass}`}>
                    <FormattedContent content={option} />
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Doubt / Ragu-ragu Button */}
        <button
          id="doubt-button"
          type="button"
          onClick={onToggleDoubt}
          aria-pressed={isDoubt}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            isDoubt
              ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flag className={`w-4 h-4 ${isDoubt ? 'text-amber-700 fill-amber-500' : 'text-slate-400'}`} />
          <span>{isDoubt ? 'Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
        </button>

        {/* Navigation Group */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
          <button
            id="prev-button"
            type="button"
            disabled={isFirst}
            onClick={onPrev}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border flex items-center justify-center gap-1.5 transition-all ${
              isFirst
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          {!isLast ? (
            <button
              id="next-button"
              type="button"
              onClick={onNext}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#12355b] hover:bg-[#0b2745] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="finish-button"
              type="button"
              onClick={onOpenFinishModal}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Selesai Ujian</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
