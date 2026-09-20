import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  unansweredCount: number;
  doubtCount: number;
  totalCount: number;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  unansweredCount,
  doubtCount,
  totalCount,
}) => {
  if (!isOpen) return null;

  const hasUnanswered = unansweredCount > 0;
  const hasDoubts = doubtCount > 0;

  return (
    <div 
      id="confirm-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-800">
              Selesaikan dan Kumpulkan Ujian?
            </h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Periksa ringkasan lembar jawaban di bawah ini sebelum mengirimkan ujian secara permanen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-3.5 text-center">
            <div className="flex justify-center text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <strong className="block text-2xl font-extrabold text-emerald-700">{answeredCount}</strong>
            <span className="text-xs font-semibold text-emerald-800">Terjawab</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-100/80 rounded-xl p-3.5 text-center">
            <div className="flex justify-center text-amber-600 mb-1">
              <HelpCircle className="w-4 h-4" />
            </div>
            <strong className="block text-2xl font-extrabold text-amber-700">{doubtCount}</strong>
            <span className="text-xs font-semibold text-amber-800">Ragu-ragu</span>
          </div>

          <div className="bg-rose-50/70 border border-rose-100/80 rounded-xl p-3.5 text-center">
            <div className="flex justify-center text-rose-500 mb-1">
              <XCircle className="w-4 h-4" />
            </div>
            <strong className="block text-2xl font-extrabold text-rose-600">{unansweredCount}</strong>
            <span className="text-xs font-semibold text-rose-800">Kosong</span>
          </div>
        </div>

        {(hasUnanswered || hasDoubts) && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Perhatian: </span>
            {hasUnanswered && hasDoubts
              ? `Masih terdapat ${unansweredCount} nomor soal belum dijawab dan ${doubtCount} nomor ditandai ragu-ragu.`
              : hasUnanswered
              ? `Masih terdapat ${unansweredCount} nomor dari total ${totalCount} soal aktif yang belum dijawab.`
              : `Masih terdapat ${doubtCount} nomor yang ditandai ragu-ragu.`}
            {' '}Pastikan Anda telah memaksimalkan pengerjaan sebelum menyelesaikan sesi.
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            id="cancel-finish-button"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors text-sm"
          >
            Kembali Memeriksa
          </button>
          <button
            id="confirm-finish-button"
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors text-sm"
          >
            Ya, Kumpulkan Jawaban
          </button>
        </div>
      </div>
    </div>
  );
};
