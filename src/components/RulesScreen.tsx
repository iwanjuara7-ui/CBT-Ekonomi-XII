import React, { useState, useEffect } from 'react';
import { Participant, AntiCheatSettings } from '../types';
import { EXAM_CONFIG, generateRandomToken } from '../data/questions';
import { ArrowLeft, Check, CheckSquare, Clock, Copy, FileText, KeyRound, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';

interface RulesScreenProps {
  participant: Participant;
  activeCount: number;
  totalCount: number;
  durationMinutes?: number;
  kkm?: number;
  antiCheat?: AntiCheatSettings;
  onBack: () => void;
  onStartExam: (token: string) => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  participant,
  activeCount,
  totalCount,
  durationMinutes = EXAM_CONFIG.durationMinutes,
  kkm = 75,
  antiCheat,
  onBack,
  onStartExam,
}) => {
  // Generate random token for this student session if not already assigned
  const [sessionToken, setSessionToken] = useState<string>(() => participant.token || generateRandomToken());
  const [tokenInput, setTokenInput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // If student clicks refresh / acak ulang
  const handleRegenerateToken = () => {
    const newToken = generateRandomToken();
    setSessionToken(newToken);
    setTokenInput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAutoFillToken = () => {
    setTokenInput(sessionToken);
  };

  const isTokenValid = tokenInput.trim().toUpperCase() === sessionToken.trim().toUpperCase();
  const canStart = agreed && isTokenValid;

  return (
    <div id="rules-screen" className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center">
      {/* Hero Banner */}
      <section className="p-6 sm:p-9 rounded-3xl text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-[#0b2745] via-[#12355b] to-[#165c6a]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Konfirmasi Identitas & Token Sesi
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Data Peserta & Peraturan Ujian
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Token ujian pada sesi ini diterbitkan secara <strong>acak khusus untuk Anda</strong>. Masukkan token tersebut di bawah ini untuk mengonfirmasi dimulainya ujian.
          </p>
        </div>
      </section>

      {/* Grid: Participant Info & Random Token */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Participant Data Card */}
        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Data Peserta Ujian
            </h2>
          </div>

          <div className="space-y-3.5 divide-y divide-slate-100 text-sm">
            <div className="pt-2 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Nama Lengkap</span>
              <strong id="rules-name" className="text-slate-800 font-bold">{participant.name}</strong>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Kelas / Rombel</span>
              <strong id="rules-class" className="text-slate-800 font-bold">{participant.studentClass}</strong>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Mata Pelajaran</span>
              <strong className="text-slate-800 font-bold">Ekonomi (Kelas XII)</strong>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Alokasi Waktu</span>
              <strong className="text-emerald-700 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {durationMinutes} Menit
              </strong>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Target Ketuntasan (KKM)</span>
              <strong className="text-purple-700 font-bold">
                Nilai ≥ {kkm}
              </strong>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Ketersediaan Soal</span>
              <strong id="rules-active-count" className="text-slate-800 font-bold">
                {activeCount} aktif ({totalCount} total di naskah)
              </strong>
            </div>
          </div>
        </article>

        {/* Random Token Card */}
        <article className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Token Ujian Acak</h2>
                  <span className="text-xs text-emerald-700 font-semibold">Khusus Sesi Ini</span>
                </div>
              </div>

              {/* Regenerate Token button */}
              <button
                type="button"
                onClick={handleRegenerateToken}
                title="Acak Ulang Token Baru"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#12355b] transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Acak Ulang</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Token di bawah ini digenerasi secara acak dan unik untuk Anda. Salin atau masukkan token tersebut pada kolom konfirmasi untuk membuka sesi ujian.
            </p>

            {/* Big Random Token Display */}
            <div className="mt-3.5 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                    TOKEN RESMI SISWA
                  </span>
                  <div id="token-display" className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-950">
                    {sessionToken}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100/50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>

            {/* Input Confirmation Field */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="confirm-token-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Konfirmasi Masukkan Token:
                </label>
                <button
                  type="button"
                  onClick={handleAutoFillToken}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Isi Otomatis
                </button>
              </div>

              <div className="relative">
                <input
                  id="confirm-token-input"
                  type="text"
                  placeholder={`Ketik: ${sessionToken}`}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono tracking-wider transition-all outline-hidden border ${
                    tokenInput.length === 0
                      ? 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-600'
                      : isTokenValid
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-100'
                      : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-100'
                  }`}
                />
                {isTokenValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-xs font-bold">
                    <Check className="w-4 h-4" />
                    <span>Sesuai</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Setiap siswa menerima kode token unik untuk mencegah kecurangan.</span>
          </div>
        </article>
      </div>

      {/* Exam Rules & Agreement */}
      <article className="mt-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#12355b]">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Tata Tertib Pelaksanaan Ujian CBT
          </h2>
        </div>

        <ul className="space-y-2.5 text-sm text-slate-600 list-decimal pl-5 leading-relaxed">
          <li>Kerjakan soal secara mandiri, teliti, dan menjunjung tinggi integritas kejujuran akademik.</li>
          <li>Baca setiap petunjuk soal dan pilihan jawaban (A, B, C, D, E) dengan cermat sebelum menentukan pilihan.</li>
          <li>Gunakan tombol <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Ragu-ragu</span> untuk menandai nomor soal yang perlu ditinjau ulang sebelum mengakhiri ujian.</li>
          <li>Waktu pengerjaan berdurasi <strong>{durationMinutes}:00 menit</strong> dan akan terus berjalan secara otomatis. Jika waktu habis, jawaban tersimpan otomatis dikumpulkan.</li>
          <li>Soal pilihan ganda aktif ({activeCount} butir) dinilai otomatis setelah ujian dikumpulkan dan menghasilkan laporan nilai instan.</li>
          {antiCheat?.enabled && (
            <li className="text-rose-900 font-semibold bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 list-none -ml-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-rose-800 font-bold">Proctoring Anti-Curang Aktif:</span>
                <span>
                  Sistem otomatis mendeteksi perpindahan tab browser, aplikasi luar, copy-paste, dan penekanan tombol devtools. 
                  {antiCheat.maxViolations > 0 
                    ? ` Batas maksimal pelanggaran adalah ${antiCheat.maxViolations} kali sebelum ujian dikunci/dikumpulkan otomatis.`
                    : ' Seluruh riwayat pelanggaran direkam secara permanen dalam laporan guru.'}
                </span>
              </div>
            </li>
          )}
        </ul>

        {/* Agreement Checkbox */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <label 
            htmlFor="rules-check" 
            className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
              agreed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <input
              id="rules-check"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-700 cursor-pointer"
            />
            <span className="text-sm font-semibold text-slate-800 select-none">
              Saya telah membaca, memahami, dan menyetujui seluruh tata tertib ujian di atas serta siap memulai ujian.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            id="back-identity-button"
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 text-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            id="start-exam-button"
            type="button"
            disabled={!canStart}
            onClick={() => onStartExam(sessionToken)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              canStart
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>
              {!isTokenValid
                ? 'Masukkan Token Ujian Dahulu'
                : !agreed
                ? 'Centang Persetujuan Dahulu'
                : 'Mulai Ujian Sekarang'}
            </span>
          </button>
        </div>
      </article>
    </div>
  );
};
