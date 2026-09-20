import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SchoolKopConfig, SubmissionRecord } from '../types';
import { DEFAULT_KOP_CONFIG, downloadExamReportPDF } from '../utils/pdfGenerator';

const STORAGE_KOP_CONFIG_KEY = 'cbt_ekonomi_xii_school_kop_config_v1';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: SubmissionRecord[];
  selectedClass: string;
  kkm: number;
  durationMinutes: number;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  submissions,
  selectedClass,
  kkm,
  durationMinutes,
}) => {
  // Load saved kop config or fallback to default
  const [kopConfig, setKopConfig] = useState<SchoolKopConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KOP_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.schoolName === 'string') {
          return {
            ...DEFAULT_KOP_CONFIG,
            ...parsed,
          };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_KOP_CONFIG;
  });

  // Export options
  const [scope, setScope] = useState<'selected' | 'all'>(selectedClass === 'all' ? 'all' : 'selected');
  const [sortBy, setSortBy] = useState<'name_asc' | 'score_desc'>('name_asc');
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sync kop config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KOP_CONFIG_KEY, JSON.stringify(kopConfig));
    } catch {
      // ignore
    }
  }, [kopConfig]);

  if (!isOpen) return null;

  // Filter and sort students based on modal options
  const targetClass = scope === 'all' ? 'all' : selectedClass;
  let studentsToPrint = submissions.filter((s) => {
    if (scope === 'all') return true;
    return s.studentClass === selectedClass;
  });

  if (sortBy === 'name_asc') {
    studentsToPrint = [...studentsToPrint].sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), 'id', { sensitivity: 'base' })
    );
  } else if (sortBy === 'score_desc') {
    studentsToPrint = [...studentsToPrint].sort((a, b) => b.score - a.score);
  }

  const passedCount = studentsToPrint.filter((s) => s.score >= kkm).length;
  const passRate = studentsToPrint.length > 0 ? Math.round((passedCount / studentsToPrint.length) * 100) : 0;
  const averageScore = studentsToPrint.length > 0
    ? (studentsToPrint.reduce((acc, curr) => acc + curr.score, 0) / studentsToPrint.length).toFixed(1)
    : '0';

  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      downloadExamReportPDF({
        submissions: studentsToPrint,
        kkm,
        durationMinutes,
        targetClass,
        kopConfig,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const handleResetKopConfig = () => {
    setKopConfig(DEFAULT_KOP_CONFIG);
  };

  return (
    <div
      id="pdf-report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#12355b] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">
                Cetak & Unduh Laporan Hasil Ujian (Format PDF)
              </h3>
              <p className="text-xs text-blue-200">
                Dilengkapi kop surat resmi sekolah, tabel nilai rapi, statistik asesmen, dan lembar tanda tangan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
          {/* Notification Banner on Success */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dokumen PDF berhasil dibuat dan diunduh ke perangkat Anda!</span>
              </div>
            </div>
          )}

          {/* Quick Options Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Scope Selection */}
              <div>
                <label htmlFor="pdf-scope-select" className="font-bold text-slate-700 block mb-1">
                  Sasaran Kelas:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    id="pdf-scope-selected"
                    type="button"
                    onClick={() => setScope('selected')}
                    disabled={selectedClass === 'all'}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                      scope === 'selected'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    Kelas {selectedClass === 'all' ? 'Aktif' : selectedClass}
                  </button>
                  <button
                    id="pdf-scope-all"
                    type="button"
                    onClick={() => setScope('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                      scope === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semua Kelas ({submissions.length} Siswa)
                  </button>
                </div>
              </div>

              {/* Sorting Selection */}
              <div>
                <label htmlFor="pdf-sort-select" className="font-bold text-slate-700 block mb-1">
                  Urutan Nama Siswa:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSortBy('name_asc')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                      sortBy === 'name_asc'
                        ? 'bg-[#12355b] text-white border-[#12355b] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Nama A - Z (Standar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('score_desc')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                      sortBy === 'score_desc'
                        ? 'bg-[#12355b] text-white border-[#12355b] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Nilai Tertinggi
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Config Form */}
            <button
              type="button"
              onClick={() => setShowConfigForm(!showConfigForm)}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-[#12355b]" />
              <span>Edit Kop & Tanda Tangan</span>
              {showConfigForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Form Pengaturan Kop & Tanda Tangan (Collapsible) */}
          {showConfigForm && (
            <div className="p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 text-xs">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#12355b]" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kustomisasi Identitas Satuan Pendidikan & Penandatangan
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleResetKopConfig}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Kembalikan ke konfigurasi standar sekolah"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pemerintah / Dinas Pendidikan:</label>
                  <input
                    type="text"
                    value={kopConfig.provinceOffice}
                    onChange={(e) => setKopConfig({ ...kopConfig, provinceOffice: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Satuan Pendidikan (Sekolah):</label>
                  <input
                    type="text"
                    value={kopConfig.schoolName}
                    onChange={(e) => setKopConfig({ ...kopConfig, schoolName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat, Telepon & Laman Sekolah:</label>
                  <input
                    type="text"
                    value={kopConfig.schoolAddress}
                    onChange={(e) => setKopConfig({ ...kopConfig, schoolAddress: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Pelajaran & Semester:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="2025/2026"
                      value={kopConfig.academicYear}
                      onChange={(e) => setKopConfig({ ...kopConfig, academicYear: e.target.value })}
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Ganjil"
                      value={kopConfig.semester}
                      onChange={(e) => setKopConfig({ ...kopConfig, semester: e.target.value })}
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota & Tanggal Laporan:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kota"
                      value={kopConfig.reportCity}
                      onChange={(e) => setKopConfig({ ...kopConfig, reportCity: e.target.value })}
                      className="w-1/3 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Tanggal Dokumen"
                      value={kopConfig.reportDate}
                      onChange={(e) => setKopConfig({ ...kopConfig, reportDate: e.target.value })}
                      className="w-2/3 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Info Guru */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-[#12355b] block">Data Guru Pengampu Ekonomi:</span>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      value={kopConfig.teacherName}
                      onChange={(e) => setKopConfig({ ...kopConfig, teacherName: e.target.value })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">NIP Guru:</label>
                    <input
                      type="text"
                      value={kopConfig.teacherNip}
                      onChange={(e) => setKopConfig({ ...kopConfig, teacherNip: e.target.value })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Info Kepala Sekolah */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-[#12355b] block">Data Kepala Sekolah:</span>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      value={kopConfig.principalName}
                      onChange={(e) => setKopConfig({ ...kopConfig, principalName: e.target.value })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">NIP Kepala Sekolah:</label>
                    <input
                      type="text"
                      value={kopConfig.principalNip}
                      onChange={(e) => setKopConfig({ ...kopConfig, principalNip: e.target.value })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pratinjau Lembar Fisik Dokumen (Paper Simulation Layout) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Pratinjau Lembar Fisik Dokumen (A4):
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Total {studentsToPrint.length} Siswa Terlampir
              </span>
            </div>

            {/* Paper Sheet Container */}
            <div
              id="printable-report-sheet"
              className="bg-white border-2 border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm text-slate-800 space-y-5 select-text font-serif leading-relaxed"
            >
              {/* 1. Kop Surat Resmi Sekolah */}
              <div className="text-center pb-3 border-b-2 border-double border-slate-800 relative">
                <p className="text-[10px] sm:text-xs font-sans tracking-widest font-semibold text-slate-600 uppercase">
                  {kopConfig.provinceOffice}
                </p>
                <h3 className="text-base sm:text-lg font-black font-sans tracking-wide text-slate-900 uppercase mt-0.5">
                  {kopConfig.schoolName}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-sans text-slate-500 mt-0.5">
                  {kopConfig.schoolAddress}
                </p>
              </div>

              {/* 2. Judul Dokumen Laporan */}
              <div className="text-center space-y-1 font-sans">
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#12355b]">
                  LAPORAN HASIL ASESMEN SUMATIF BERBASIS KOMPUTER (CBT)
                </h4>
                <p className="text-xs font-bold text-slate-700">
                  MATA PELAJARAN: EKONOMI (AKUNTANSI KELAS XII)
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Materi: Akuntansi sebagai Sistem Informasi & Persamaan Dasar Akuntansi
                </p>
              </div>

              {/* 3. Metadata Header */}
              <div className="grid grid-cols-2 gap-4 text-[11px] font-sans bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 inline-block w-28">Tahun Pelajaran</span>: <strong className="text-slate-800">{kopConfig.academicYear} ({kopConfig.semester})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 inline-block w-28">Sasaran Kelas</span>: <strong className="text-slate-800">{targetClass === 'all' ? 'Seluruh Kelas XII' : `Kelas ${targetClass}`}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 inline-block w-28">Jumlah Peserta</span>: <strong className="text-slate-800">{studentsToPrint.length} Siswa</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 inline-block w-28">Standar KKM</span>: <strong className="text-purple-700">Nilai ≥ {kkm}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 inline-block w-28">Alokasi Waktu</span>: <strong className="text-emerald-700">{durationMinutes} Menit</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 inline-block w-28">Tanggal Terbit</span>: <strong className="text-slate-800">{kopConfig.reportDate}</strong>
                  </div>
                </div>
              </div>

              {/* 4. Tabel Nilai Mini-Preview */}
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-[11px] text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#12355b] text-white font-bold text-center">
                      <th className="py-2 px-2 border border-slate-300 w-8">No</th>
                      <th className="py-2 px-3 border border-slate-300 text-left">Nama Lengkap Siswa</th>
                      <th className="py-2 px-2 border border-slate-300 w-16">Kelas</th>
                      <th className="py-2 px-2 border border-slate-300 w-16">Token</th>
                      <th className="py-2 px-2 border border-slate-300 w-12">Nilai</th>
                      <th className="py-2 px-2 border border-slate-300 w-24">Status (≥{kkm})</th>
                      <th className="py-2 px-1.5 border border-slate-300 w-8">B</th>
                      <th className="py-2 px-1.5 border border-slate-300 w-8">S</th>
                      <th className="py-2 px-1.5 border border-slate-300 w-8">K</th>
                      <th className="py-2 px-2 border border-slate-300 w-12">%</th>
                      <th className="py-2 px-2 border border-slate-300 w-16">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentsToPrint.slice(0, 8).map((s, idx) => {
                      const isPassed = s.score >= kkm;
                      const accuracy = s.totalActive > 0 ? ((s.correct / s.totalActive) * 100).toFixed(0) + '%' : '0%';
                      return (
                        <tr key={s.id || idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">{s.name}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center text-slate-700">{s.studentClass}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono text-[10px] text-slate-600">{s.token || '-'}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-black text-[#12355b]">{s.score}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isPassed ? 'TUNTAS' : 'BELUM TUNTAS'}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 border border-slate-300 text-center font-bold text-emerald-700">{s.correct}</td>
                          <td className="py-1.5 px-1.5 border border-slate-300 text-center font-bold text-rose-700">{s.wrong}</td>
                          <td className="py-1.5 px-1.5 border border-slate-300 text-center text-slate-400">{s.unanswered}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-mono text-[10px]">{accuracy}</td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center text-slate-500 text-[10px]">{s.submittedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {studentsToPrint.length > 8 && (
                <p className="text-[11px] font-sans text-slate-400 text-center italic">
                  ... dan {studentsToPrint.length - 8} siswa lainnya (semua baris otomatis terangkum dalam berkas PDF & cetak).
                </p>
              )}

              {/* 5. Ringkasan Statistik */}
              <div className="font-sans bg-slate-100/80 p-3 rounded-lg border border-slate-300 text-[11px] space-y-1">
                <span className="font-bold text-[#12355b] uppercase block">
                  Ringkasan Statistik Hasil Asesmen:
                </span>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-700">
                  <span>Rata-rata Nilai: <strong>{averageScore}</strong></span>
                  <span>Tertinggi: <strong>{studentsToPrint.length > 0 ? Math.max(...studentsToPrint.map((s) => s.score)) : 0}</strong></span>
                  <span>Terendah: <strong>{studentsToPrint.length > 0 ? Math.min(...studentsToPrint.map((s) => s.score)) : 0}</strong></span>
                  <span>Tuntas KKM (≥{kkm}): <strong className="text-emerald-700">{passedCount} Siswa ({passRate}%)</strong></span>
                  <span>Belum Tuntas: <strong className="text-rose-700">{studentsToPrint.length - passedCount} Siswa</strong></span>
                </div>
              </div>

              {/* 6. Lembar Tanda Tangan Fisik */}
              <div className="pt-6 font-sans grid grid-cols-2 gap-8 text-[11px] text-slate-800">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">{kopConfig.principalName}</p>
                  <p className="text-slate-600 text-[10px]">NIP. {kopConfig.principalNip}</p>
                </div>

                <div className="text-left">
                  <p>{kopConfig.reportCity}, {kopConfig.reportDate}</p>
                  <p className="font-semibold">Guru Mata Pelajaran Ekonomi,</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">{kopConfig.teacherName}</p>
                  <p className="text-slate-600 text-[10px]">NIP. {kopConfig.teacherNip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Format: <strong>Dokumen PDF A4 Vektor Resmi</strong> · Standar KKM: <strong>Nilai ≥ {kkm}</strong>
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              id="print-physical-button"
              type="button"
              onClick={handleDirectPrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Cetak langsung ke printer fisik atau gunakan Save to PDF browser"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Cetak Fisik</span>
            </button>

            <button
              id="download-pdf-button"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Unduh Dokumen PDF (.pdf)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
