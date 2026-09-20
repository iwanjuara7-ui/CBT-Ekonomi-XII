import React from 'react';
import { Question } from '../types';

interface QuestionNavProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  doubts: Set<number>;
  onSelect: (index: number) => void;
  isMobileDrawer?: boolean;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentIndex,
  answers,
  doubts,
  onSelect,
  isMobileDrawer = false,
}) => {
  return (
    <aside 
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm ${
        isMobileDrawer ? 'w-full' : 'sticky top-24'
      }`}
      aria-label="Navigasi nomor soal"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="font-extrabold text-slate-800 text-base">
          Navigasi Soal
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
          {Object.keys(answers).length}/{questions.length} Dijawab
        </span>
      </div>

      <div 
        id={isMobileDrawer ? 'number-grid-mobile' : 'number-grid'}
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2 my-3 max-h-[320px] overflow-y-auto pr-1"
      >
        {questions.map((q, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = Boolean(answers[q.id]);
          const isDoubt = doubts.has(q.id);

          let buttonClasses = 'h-10 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center relative ';

          if (isCurrent) {
            buttonClasses += 'bg-[#12355b] text-white border-[#12355b] shadow-md shadow-[#12355b]/25 ';
          } else if (isDoubt) {
            buttonClasses += 'bg-amber-50 text-amber-800 border-amber-400 font-extrabold ';
          } else if (isAnswered) {
            buttonClasses += 'bg-emerald-50 text-emerald-700 border-emerald-400 font-bold ';
          } else {
            buttonClasses += 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 ';
          }

          if (isDoubt && !isCurrent) {
            buttonClasses += 'ring-2 ring-amber-300 ring-offset-1 ';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Buka soal nomor dokumen ${q.id}`}
              className={buttonClasses}
            >
              <span>{q.id}</span>
              {isAnswered && (
                <span className="text-[10px] font-black leading-none opacity-85 uppercase">
                  {answers[q.id]}
                </span>
              )}
              {isDoubt && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 leading-relaxed font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-[#12355b] inline-block shrink-0" />
          <span>Soal Aktif Dibuka</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400 inline-block shrink-0" />
          <span>Sudah Dijawab</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400 inline-block shrink-0" />
          <span>Ditandai Ragu-ragu</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 inline-block shrink-0" />
          <span>Belum Dijawab</span>
        </div>
      </div>
    </aside>
  );
};
