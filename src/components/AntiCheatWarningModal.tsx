import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { CheatViolation } from '../types';

interface AntiCheatWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  violations: CheatViolation[];
  maxViolations: number;
  isForceSubmitting: boolean;
  onForceSubmitNow?: () => void;
}

export const AntiCheatWarningModal: React.FC<AntiCheatWarningModalProps> = ({
  isOpen,
  onClose,
  violations,
  maxViolations,
  isForceSubmitting,
  onForceSubmitNow,
}) => {
  if (!isOpen) return null;

  const count = violations.length;
  const latest = violations[violations.length - 1];
  const isExceeded = maxViolations > 0 && count >= maxViolations;

  return (
    <div
      id="anti-cheat-warning-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-rose-400 animate-in zoom-in-95 duration-200 text-center">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
          isExceeded ? 'bg-rose-600 text-white animate-bounce' : 'bg-amber-100 text-amber-700'
        }`}>
          {isExceeded ? <Lock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 text-rose-600" />}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isExceeded ? 'Ujian Dikunci: Melebihi Batas Pelanggaran!' : 'Peringatan Sistem Anti-Curang!'}
        </h3>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {isExceeded ? (
            <span className="text-rose-700 font-bold">
              Anda telah melakukan {count} kali pelanggaran aturan ujian. Sesuai ketentuan asesmen sekolah, lembar jawaban Anda dikumpulkan secara otomatis.
            </span>
          ) : (
            <span>
              Sistem CBT mendeteksi aktivitas mencurigakan yang melanggar integritas akademik:
            </span>
          )}
        </p>

        {/* Latest Violation Detail Card */}
        {latest && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs sm:text-sm text-rose-950">
            <div className="flex items-center gap-2 font-bold text-rose-800 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{latest.type}</span>
              <span className="ml-auto text-[11px] font-mono text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                {latest.timestamp}
              </span>
            </div>
            <p className="text-rose-900 leading-relaxed font-medium">
              {latest.description}
            </p>
          </div>
        )}

        {/* Violation Counter Badge */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-slate-600">Total Pelanggaran Terdeteksi:</span>
          <span className={`font-black px-2.5 py-0.5 rounded-full ${
            isExceeded ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {count} {maxViolations > 0 ? `/ ${maxViolations} Toleransi` : 'kali'}
          </span>
        </div>

        {/* Log History */}
        {violations.length > 1 && (
          <div className="mt-3 text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Riwayat Pelanggaran Sesi Ini:
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-600 pr-1">
              {violations.slice(0, -1).reverse().map((v, i) => (
                <div key={i} className="flex justify-between items-center py-1 px-2 rounded bg-slate-50 border border-slate-150">
                  <span className="truncate mr-2">• {v.type}: {v.description}</span>
                  <span className="text-slate-400 shrink-0 font-mono text-[10px]">{v.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
          {isExceeded ? (
            <button
              type="button"
              id="btn-force-submit-violation"
              onClick={onForceSubmitNow}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Kumpulkan Ujian Sekarang
            </button>
          ) : (
            <button
              type="button"
              id="btn-dismiss-anti-cheat"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#12355b] hover:bg-[#0b2745] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Saya Mengerti & Kembali Mengerjakan Ujian</span>
            </button>
          )}

          <p className="text-[11px] text-slate-400">
            Seluruh catatan aktivitas pelanggaran direkam secara transparan di log laporan guru.
          </p>
        </div>
      </div>
    </div>
  );
};
