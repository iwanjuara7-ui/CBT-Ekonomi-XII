import React, { useState } from 'react';
import { Participant, Question, SubmissionRecord } from '../types';
import { FormattedContent } from './FormattedContent';
import { CheckCircle2, XCircle, Award, RotateCcw, Home, Printer, ChevronDown, ChevronUp, AlertCircle, FileText, Check, X } from 'lucide-react';

interface ResultScreenProps {
  participant: Participant;
  submission: SubmissionRecord;
  activeQuestions: Question[];
  totalDraftCount: number;
  reason: 'manual' | 'time' | 'violation';
  kkm?: number;
  durationMinutes?: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  participant,
  submission,
  activeQuestions,
  totalDraftCount,
  reason,
  kkm = 75,
  durationMinutes = 30,
  onRestart,
  onGoHome,
}) => {
  const [showReview, setShowReview] = useState(false);

  const isPassed = submission.score >= kkm;

  return (
    <div id="result-screen" className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <section className="p-6 sm:p-9 rounded-3xl text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-[#0b2745] via-[#12355b] to-[#165c6a]">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
              Ringkasan Asesmen CBT
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Ujian Telah Selesai
            </h1>
            <p id="result-participant" className="mt-2 text-sm sm:text-base font-semibold text-blue-100 flex flex-wrap items-center gap-2">
              <span>Peserta: {participant.name} · {participant.studentClass}</span>
              {(submission.token || participant.token) && (
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded text-xs text-amber-300 font-bold border border-white/20">
                  Token: {submission.token || participant.token}
                </span>
              )}
            </p>
            <p id="submission-message" className="mt-1 text-xs sm:text-sm text-blue-200">
              {reason === 'violation'
                ? 'Ujian dikumpulkan otomatis oleh sistem karena mencapai batas toleransi pelanggaran tata tertib.'
                : reason === 'time'
                ? `Waktu ujian telah berakhir (${durationMinutes}:00). Lembar jawaban yang telah terisi dinilai otomatis oleh sistem.`
                : 'Ujian telah dikumpulkan dengan sukses. Penilaian otomatis telah dihitung secara instan.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 sm:p-5 text-center min-w-[170px] shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
              Nilai Akhir CBT
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {submission.score}
            </div>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-extrabold ${
              isPassed ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
            }`}>
              {isPassed ? `TUNTAS (≥ KKM ${kkm})` : `BELUM TUNTAS (< KKM ${kkm})`}
            </span>
          </div>
        </div>
      </section>

      {/* 6 Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Soal Aktif Dinilai</span>
          <strong id="result-total" className="block text-2xl sm:text-3xl font-black text-slate-800 mt-1">
            {submission.totalActive}
          </strong>
          <span className="text-[11px] text-slate-400 mt-1 block">Dari naskah dokumen</span>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold text-slate-500">Jumlah Benar</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <strong id="result-correct" className="block text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {submission.correct}
          </strong>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Jawaban tepat</span>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold text-slate-500">Jumlah Salah</span>
            <XCircle className="w-4 h-4" />
          </div>
          <strong id="result-wrong" className="block text-2xl sm:text-3xl font-black text-rose-600 mt-1">
            {submission.wrong}
          </strong>
          <span className="text-[11px] text-rose-500/80 mt-1 block">Jawaban kurang tepat</span>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Belum Dijawab</span>
          <strong id="result-unanswered" className="block text-2xl sm:text-3xl font-black text-slate-700 mt-1">
            {submission.unanswered}
          </strong>
          <span className="text-[11px] text-slate-400 mt-1 block">Dilewati / kosong</span>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Soal Draft Dikecualikan</span>
          <strong id="result-draft" className="block text-2xl sm:text-3xl font-black text-amber-700 mt-1">
            {totalDraftCount}
          </strong>
          <span className="text-[11px] text-slate-400 mt-1 block">Perlu dilengkapi dokumen</span>
        </article>

        <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold text-slate-500">Nilai Skala 100</span>
            <Award className="w-4 h-4 text-[#12355b]" />
          </div>
          <strong id="result-score" className="block text-2xl sm:text-3xl font-black text-[#12355b] mt-1">
            {submission.score}
          </strong>
          <span className="text-[11px] text-slate-400 mt-1 block">Akurasi {(submission.correct / submission.totalActive * 100).toFixed(1)}%</span>
        </article>
      </div>

      {/* Violations Notice Card (If any recorded) */}
      {submission.violations && submission.violations.length > 0 && (
        <div className="mt-5 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Catatan Integritas Ujian: {submission.violations.length} Pelanggaran Terdeteksi</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
              Audit CBT
            </span>
          </div>
          <p className="text-xs text-rose-900 leading-relaxed">
            Sistem pengawas otomatis mencatat aktivitas di luar lembar ujian yang terdeteksi selama pengerjaan berlangsung:
          </p>
          <div className="space-y-1.5 pt-1">
            {submission.violations.map((v, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-white border border-rose-200/80 flex items-start justify-between gap-3 text-xs">
                <div>
                  <strong className="text-rose-900 block font-semibold">{v.type}</strong>
                  <span className="text-slate-600">{v.description}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                  {v.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note Notice */}
      <div className="mt-5 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-amber-900 text-xs sm:text-sm flex items-start gap-3 leading-relaxed">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ketentuan Penilaian Dokumen: </span>
          Penilaian otomatis hanya berlaku untuk soal pilihan ganda aktif yang memiliki kelengkapan angka, opsi jawaban, dan kunci resmi dari dokumen. Nomor dengan keterangan draft tidak memengaruhi kalkulasi skor.
        </div>
      </div>

      {/* Answer Review Collapsible Accordion */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowReview(!showReview)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#12355b]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Tinjau Lembar Jawaban & Pembahasan Lengkap
              </h3>
              <p className="text-xs text-slate-500">
                Lihat koreksi jawaban Anda dan pelajari pembahasan setiap butir soal aktif
              </p>
            </div>
          </div>
          {showReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showReview && (
          <div className="p-4 sm:p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
            {activeQuestions.map((q, idx) => {
              const studentAnswer = submission.answers[q.id];
              const isCorrect = studentAnswer === q.answer;
              const isAnswered = Boolean(studentAnswer);

              return (
                <article key={q.id} className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Dokumen No. {q.id} · {q.level}
                      </span>
                    </div>

                    <div>
                      {!isAnswered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          Tidak Dijawab
                        </span>
                      ) : isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3.5 h-3.5" /> Benar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          <X className="w-3.5 h-3.5" /> Salah
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-800 mt-2 mb-3">
                    <FormattedContent content={q.text} image={q.image} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 mb-3 pl-2">
                    {q.options.map((opt, optIdx) => {
                      const key = String.fromCharCode(65 + optIdx);
                      const isKeyCorrect = key === q.answer;
                      const isKeyStudent = key === studentAnswer;

                      let rowClass = 'p-2 rounded-lg flex items-start gap-2 ';
                      if (isKeyCorrect) {
                        rowClass += 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200';
                      } else if (isKeyStudent && !isCorrect) {
                        rowClass += 'bg-rose-50 text-rose-900 line-through border border-rose-200';
                      } else {
                        rowClass += 'text-slate-600';
                      }

                      return (
                        <div key={key} className={rowClass}>
                          <span className="font-bold shrink-0">{key}.</span>
                          <div className="flex-1">
                            <FormattedContent content={opt} />
                          </div>
                          {isKeyCorrect && <span className="text-emerald-700 ml-auto text-[11px] font-bold shrink-0">✓ Kunci</span>}
                          {isKeyStudent && !isKeyCorrect && <span className="text-rose-600 ml-auto text-[11px] font-bold shrink-0">Pilihan Anda</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-lg text-xs text-blue-900 border border-blue-100">
                    <span className="font-bold block mb-1 text-[#12355b]">Pembahasan:</span>
                    <FormattedContent content={q.discussion} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            id="restart-button"
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Ulang Sesi</span>
          </button>

          <button
            id="result-home-button"
            type="button"
            onClick={onGoHome}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Halaman Depan</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Bukti Nilai</span>
        </button>
      </div>
    </div>
  );
};
