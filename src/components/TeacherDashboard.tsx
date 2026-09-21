import React, { useState, useMemo, useEffect } from 'react';
import { Question, SubmissionRecord, ExamSettings, AntiCheatSettings } from '../types';
import { QuestionBankView } from './QuestionBankView';
import { PdfReportModal } from './PdfReportModal';
import { GoogleSheetsIntegrationModal } from './GoogleSheetsIntegrationModal';
import { 
  Award, CheckCircle2, Download, FileSpreadsheet, LogOut, Search, Trash2, 
  Users, Eye, EyeOff, X, Filter, School, Check, RotateCcw, SlidersHorizontal, 
  FileDown, HelpCircle, Table, CheckSquare, Square, ArrowDownAZ, ArrowUpAZ,
  Clock, Sparkles, Save, Info, FileText, Printer, Database, CloudUpload, ExternalLink,
  ShieldCheck, ShieldAlert, ShieldOff, KeyRound, UserCheck, AlertTriangle, Lock,
  Shuffle, Shield
} from 'lucide-react';
import { 
  getTeacherCredentials, 
  saveTeacherCredentials, 
  resetTeacherCredentials, 
  DEFAULT_TEACHER_CREDENTIALS,
  TeacherCredentials 
} from '../utils/authService';

interface TeacherDashboardProps {
  submissions: SubmissionRecord[];
  questions: Question[];
  examSettings: ExamSettings;
  onUpdateSettings: (settings: ExamSettings) => void;
  onSubmissionsImported?: (imported: SubmissionRecord[]) => void;
  onToggleQuestionActive: (id: number) => void;
  onActivateAllQuestions?: () => void;
  onImportQuestions?: (imported: Question[], mode: 'append' | 'replace') => void;
  onResetQuestions?: () => void;
  onDeleteQuestion?: (id: number) => void;
  onClearSubmissions: () => void;
  onDeleteSubmission: (id: string) => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  submissions,
  questions,
  examSettings,
  onUpdateSettings,
  onSubmissionsImported,
  onToggleQuestionActive,
  onActivateAllQuestions,
  onImportQuestions,
  onResetQuestions,
  onDeleteQuestion,
  onClearSubmissions,
  onDeleteSubmission,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'recap' | 'questions' | 'settings' | 'sheets'>('recap');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);

  // Settings state for KKM, Duration, and Anti-Cheat configuration
  const [kkmInput, setKkmInput] = useState<number>(examSettings.kkm);
  const [durationInput, setDurationInput] = useState<number>(examSettings.durationMinutes);
  const [antiCheatInput, setAntiCheatInput] = useState<AntiCheatSettings>(() => ({
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
    ...(examSettings.antiCheat || {}),
  }));
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Auth & Credentials Management State
  const [teacherCreds, setTeacherCreds] = useState<TeacherCredentials>(() => getTeacherCredentials());
  const [newUsernameInput, setNewUsernameInput] = useState<string>(() => getTeacherCredentials().username);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showAuthPassword, setShowAuthPassword] = useState<boolean>(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Sync inputs if examSettings prop updates
  useEffect(() => {
    setKkmInput(examSettings.kkm);
    setDurationInput(examSettings.durationMinutes);
    if (examSettings.antiCheat) {
      setAntiCheatInput((prev) => ({ ...prev, ...examSettings.antiCheat }));
    }
  }, [examSettings.kkm, examSettings.durationMinutes, examSettings.antiCheat]);

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthErrorMessage(null);
    setAuthSuccessMessage(null);

    const cleanUsername = newUsernameInput.trim();
    if (!cleanUsername) {
      setAuthErrorMessage('Username guru tidak boleh kosong.');
      return;
    }

    if (newPasswordInput || confirmPasswordInput) {
      if (newPasswordInput.length < 4) {
        setAuthErrorMessage('Password baru minimal 4 karakter demi keamanan.');
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        setAuthErrorMessage('Konfirmasi password tidak sesuai dengan password baru.');
        return;
      }
    }

    const passwordToSave = newPasswordInput ? newPasswordInput : teacherCreds.password;
    const success = saveTeacherCredentials({
      username: cleanUsername,
      password: passwordToSave,
    });

    if (success) {
      const updated = getTeacherCredentials();
      setTeacherCreds(updated);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setAuthSuccessMessage(`Kredensial login guru berhasil diperbarui! Username: "${cleanUsername}".`);
      setTimeout(() => setAuthSuccessMessage(null), 5000);
    } else {
      setAuthErrorMessage('Gagal menyimpan kredensial ke penyimpanan lokal browser.');
    }
  };

  const handleResetCredentials = () => {
    if (window.confirm('Kembalikan username dan password guru ke akun bawaan (Username: endang8, Password: kinanel123)?')) {
      const def = resetTeacherCredentials();
      setTeacherCreds(def);
      setNewUsernameInput(def.username);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setAuthErrorMessage(null);
      setAuthSuccessMessage('Kredensial login guru telah dikembalikan ke bawaan: endang8 / kinanel123');
      setTimeout(() => setAuthSuccessMessage(null), 5000);
    }
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKkm = Math.max(10, Math.min(100, Math.round(Number(kkmInput) || 75)));
    const cleanDuration = Math.max(5, Math.min(240, Math.round(Number(durationInput) || 30)));

    onUpdateSettings({
      kkm: cleanKkm,
      durationMinutes: cleanDuration,
      antiCheat: antiCheatInput,
    });
    setKkmInput(cleanKkm);
    setDurationInput(cleanDuration);
    setSettingsMessage(`Pengaturan berhasil disimpan! KKM: ${cleanKkm}, Durasi: ${cleanDuration} Menit, Anti-Curang: ${antiCheatInput.enabled ? 'Aktif' : 'Nonaktif'}.`);
    setTimeout(() => setSettingsMessage(null), 4000);
  };

  const handleResetSettings = () => {
    const defaultAntiCheat: AntiCheatSettings = {
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

    onUpdateSettings({
      kkm: 75,
      durationMinutes: 30,
      antiCheat: defaultAntiCheat,
    });
    setKkmInput(75);
    setDurationInput(30);
    setAntiCheatInput(defaultAntiCheat);
    setSettingsMessage('Pengaturan dikembalikan ke standar awal (KKM 75, Durasi 30 Menit, Anti-Curang Standar Aktif).');
    setTimeout(() => setSettingsMessage(null), 4000);
  };

  // Real-time simulated metrics for settings tab based on current draft KKM
  const simulatedPassedCount = useMemo(() => {
    return submissions.filter((s) => s.score >= kkmInput).length;
  }, [submissions, kkmInput]);

  const simulatedPassRate = submissions.length
    ? Math.round((simulatedPassedCount / submissions.length) * 100)
    : 0;

  // CSV Export customization modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportDelimiter, setExportDelimiter] = useState<';' | ','>(';');
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [includeTitleBanner, setIncludeTitleBanner] = useState<boolean>(false);
  const [includeSummaryRows, setIncludeSummaryRows] = useState<boolean>(true);

  // PDF Report modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Google Sheets integration modal state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Unique classes with count for filtering
  const classStats = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) => {
      const cls = (s.studentClass || 'Tanpa Kelas').trim();
      map.set(cls, (map.get(cls) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [submissions]);

  // Filtered and Sorted submissions by Class, Search query, and Name (A-Z)
  const filteredSubmissions = useMemo(() => {
    const filtered = submissions.filter((s) => {
      const studentClassClean = (s.studentClass || 'Tanpa Kelas').trim();
      if (selectedClass !== 'all' && studentClassClean !== selectedClass) {
        return false;
      }
      if (searchStudent.trim()) {
        const q = searchStudent.toLowerCase();
        const inName = s.name.toLowerCase().includes(q);
        const inClass = s.studentClass.toLowerCase().includes(q);
        const inToken = (s.token || '').toLowerCase().includes(q);
        if (!inName && !inClass && !inToken) return false;
      }
      return true;
    });

    // Default: Sort student names systematically A-Z (or Z-A if toggled)
    return filtered.sort((a, b) => {
      const comparison = a.name.trim().localeCompare(b.name.trim(), 'id', { sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [submissions, selectedClass, searchStudent, sortOrder]);

  // Statistics based on active filter
  const currentKkm = examSettings.kkm;
  const totalStudents = filteredSubmissions.length;
  const totalAllStudents = submissions.length;
  const averageScore = totalStudents
    ? Math.round(filteredSubmissions.reduce((acc, curr) => acc + curr.score, 0) / totalStudents)
    : 0;
  const passedStudents = filteredSubmissions.filter((s) => s.score >= currentKkm).length;
  const passRate = totalStudents ? Math.round((passedStudents / totalStudents) * 100) : 0;

  // Clean, structured CSV export engine with RFC 4180 escaping and UTF-8 BOM
  const executeExportCSV = (opts?: {
    delimiter?: ';' | ',';
    exportAll?: boolean;
    withBanner?: boolean;
    withSummary?: boolean;
  }) => {
    const delimiter = opts?.delimiter ?? exportDelimiter;
    const exportAll = opts?.exportAll ?? (exportScope === 'all');
    const withBanner = opts?.withBanner ?? includeTitleBanner;
    const withSummary = opts?.withSummary ?? includeSummaryRows;

    const rawData = exportAll ? submissions : filteredSubmissions;
    if (!rawData.length) return;

    // Ensure exported CSV data is systematically sorted A-Z by student name
    const dataToExport = [...rawData].sort((a, b) => 
      a.name.trim().localeCompare(b.name.trim(), 'id', { sensitivity: 'base' })
    );

    // RFC 4180 standard escaping: wrap values in quotes and escape inner quotes (" -> "")
    const escapeCell = (val: string | number | undefined | null) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const lines: string[] = [];

    // Optional metadata banner at top
    if (withBanner) {
      const classLabel = (!exportAll && selectedClass !== 'all') ? `Kelas ${selectedClass}` : 'Semua Kelas';
      lines.push([`LAPORAN REKAPITULASI HASIL UJIAN CBT EKONOMI KELAS XII`].map(escapeCell).join(delimiter));
      lines.push([`Materi: Akuntansi sebagai Sistem Informasi & Persamaan Dasar Akuntansi`].map(escapeCell).join(delimiter));
      lines.push([`Target Kelas: ${classLabel}`, `Standar KKM: Nilai >= ${currentKkm}`, `Alokasi Waktu: ${examSettings.durationMinutes} Menit`].map(escapeCell).join(delimiter));
      lines.push([`Jumlah Peserta: ${dataToExport.length} Siswa`, `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`].map(escapeCell).join(delimiter));
      lines.push(''); // Blank line separator
    }

    // Precise structured table headers
    const headers = [
      'No',
      'Nama Siswa',
      'Kelas',
      'Token Ujian',
      'Nilai Akhir',
      `Status KKM (>=${currentKkm})`,
      'Jumlah Benar',
      'Jumlah Salah',
      'Tidak Dijawab',
      'Total Soal',
      'Persentase Ketepatan',
      'Pelanggaran (Anti-Curang)',
      'Waktu Pengumpulan',
    ];
    lines.push(headers.map(escapeCell).join(delimiter));

    // Data rows, row-by-row and column-by-column
    dataToExport.forEach((s, idx) => {
      const percentage = s.totalActive > 0 ? ((s.correct / s.totalActive) * 100).toFixed(1) + '%' : '0%';
      const kkmStatus = s.score >= currentKkm ? 'TUNTAS' : 'BELUM TUNTAS';
      const violationCount = s.violations?.length ?? s.violationCount ?? 0;
      const row = [
        idx + 1,
        s.name,
        s.studentClass || '-',
        s.token || '-',
        s.score,
        kkmStatus,
        s.correct,
        s.wrong,
        s.unanswered,
        s.totalActive,
        percentage,
        violationCount > 0 ? `${violationCount} Kali` : 'Tertib (0)',
        s.submittedAt || '-',
      ];
      lines.push(row.map(escapeCell).join(delimiter));
    });

    // Optional summary statistics block at the end
    if (withSummary && dataToExport.length > 0) {
      const avg = (dataToExport.reduce((acc, curr) => acc + curr.score, 0) / dataToExport.length).toFixed(1);
      const max = Math.max(...dataToExport.map((s) => s.score));
      const min = Math.min(...dataToExport.map((s) => s.score));
      const passedCount = dataToExport.filter((s) => s.score >= currentKkm).length;
      const passedPct = Math.round((passedCount / dataToExport.length) * 100);

      lines.push('');
      lines.push(['--- STATISTIK RINGKASAN REKAPITULASI ---'].map(escapeCell).join(delimiter));
      lines.push(['Rata-rata Nilai', avg].map(escapeCell).join(delimiter));
      lines.push(['Nilai Tertinggi', max].map(escapeCell).join(delimiter));
      lines.push(['Nilai Terendah', min].map(escapeCell).join(delimiter));
      lines.push([`Tuntas KKM (Nilai >= ${currentKkm})`, `${passedCount} dari ${dataToExport.length} siswa (${passedPct}%)`].map(escapeCell).join(delimiter));
      lines.push([`Belum Tuntas (< ${currentKkm})`, `${dataToExport.length - passedCount} siswa`].map(escapeCell).join(delimiter));
    }

    // Join with CRLF for standard Windows Excel and macOS/Linux spreadsheet support
    const csvContent = lines.join('\r\n');

    // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel natively recognises UTF-8 and column delimitation
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const classTag = (!exportAll && selectedClass !== 'all') 
      ? `_${selectedClass.replace(/[^a-zA-Z0-9]/g, '_')}`
      : '_semua_kelas';
    const appTag = delimiter === ';' ? '_excel_id' : '_standard';
    link.download = `rekap_nilai_cbt_ekonomi_xii${classTag}${appTag}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  return (
    <div id="admin-screen" className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#0b2745] via-[#12355b] to-[#176b60] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block mb-1">
              PANEL GURU / ADMIN PENGAWAS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Dashboard Pengelolaan Ujian CBT
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Mata Pelajaran Ekonomi Kelas XII · Pantau hasil sesi real-time dan kelola bank soal naskah dokumen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="logout-admin-button"
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar ke Portal</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-white/10 pt-3 pb-3 overflow-x-auto">
          <button
            id="recap-tab"
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'recap'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Rekapitulasi Nilai Siswa</span>
          </button>
          <button
            id="questions-tab"
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bank Soal Dokumen (30 Nomor)</span>
          </button>
          <button
            id="settings-tab"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Pengaturan KKM & Waktu</span>
          </button>
          <button
            id="google-sheets-tab"
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-[#0f9d58] text-white shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Integrasi Google Sheet</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'recap' ? (
          <section id="recap-view">
            {/* Active Configuration Overview Banner */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-[#12355b]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800">Standar Evaluasi Sesi:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                    <Award className="w-3.5 h-3.5" /> KKM: {currentKkm}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    <Clock className="w-3.5 h-3.5" /> Durasi: {examSettings.durationMinutes} Menit
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="self-start sm:self-auto text-xs font-bold text-[#12355b] hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ubah KKM / Waktu</span>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-[#12355b]">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Peserta</span>
                  <Users className="w-4 h-4" />
                </div>
                <strong id="participant-count" className="block text-3xl font-black text-slate-900 mt-2">
                  {totalStudents}
                </strong>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {selectedClass === 'all' ? `${totalAllStudents} total peserta di sesi` : `Peserta di kelas ${selectedClass}`}
                </span>
              </article>

              <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ujian Selesai</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <strong id="completed-count" className="block text-3xl font-black text-emerald-700 mt-2">
                  {totalStudents}
                </strong>
                <span className="text-[11px] text-emerald-600/80 mt-1 block">
                  {selectedClass === 'all' ? 'Telah mengumpulkan lembar' : `Telah selesai (${selectedClass})`}
                </span>
              </article>

              <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Nilai</span>
                  <Award className="w-4 h-4" />
                </div>
                <strong id="average-score" className="block text-3xl font-black text-[#12355b] mt-2">
                  {averageScore}
                </strong>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {selectedClass === 'all' ? 'Dari skala 0-100 seluruh kelas' : `Rata-rata kelas ${selectedClass}`}
                </span>
              </article>

              <article className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-purple-600">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ketuntasan (≥{currentKkm})</span>
                  <Award className="w-4 h-4" />
                </div>
                <strong className="block text-3xl font-black text-purple-700 mt-2">
                  {passRate}%
                </strong>
                <span className="text-[11px] text-purple-600/80 mt-1 block">
                  {passedStudents} dari {totalStudents} peserta {selectedClass !== 'all' ? `(${selectedClass})` : ''}
                </span>
              </article>
            </div>

            {/* Recap Table Card */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Rekapitulasi Hasil Ujian Siswa
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data jawaban siswa dinilai secara otomatis berdasarkan kunci jawaban dokumen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa atau token..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-hidden w-48 sm:w-56"
                    />
                  </div>

                  {submissions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Google Sheets Cloud Backend Button */}
                      <button
                        id="open-google-sheets-modal-button"
                        type="button"
                        onClick={() => setIsSheetsModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Integrasikan CBT ke Google Spreadsheet via Google Apps Script (Auto-Sync, Upload Rekap, Tarik Data)"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                        <span>Google Sheets</span>
                      </button>

                      {/* Primary Formal PDF Report Download Button */}
                      <button
                        id="open-pdf-report-modal-button"
                        type="button"
                        onClick={() => setIsPdfModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#12355b] hover:bg-[#0c243f] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Unduh laporan nilai resmi berformat PDF lengkap dengan Kop Sekolah, tabel nilai rapi, dan lembar pengesahan tanda tangan"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Unduh Laporan PDF</span>
                      </button>

                      {/* Primary Direct Download for Excel */}
                      <button
                        id="export-csv-excel-button"
                        type="button"
                        onClick={() => executeExportCSV({ delimiter: ';', exportAll: false })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Unduh file CSV terpisah rapi untuk Microsoft Excel (Pemisah Titik Koma ;)"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>{selectedClass !== 'all' ? `Unduh CSV Excel (${selectedClass})` : 'Unduh CSV Excel'}</span>
                      </button>

                      {/* Options & Preview Modal Button */}
                      <button
                        id="open-export-modal-button"
                        type="button"
                        onClick={() => setIsExportModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Sesuaikan pemisah kolom (Excel/Google Sheets), cakupan kelas, dan pratinjau tabel"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        <span>Opsi CSV</span>
                      </button>

                      {selectedClass !== 'all' && (
                        <button
                          id="export-all-csv-button"
                          type="button"
                          onClick={() => executeExportCSV({ delimiter: ';', exportAll: true })}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Unduh seluruh data dari semua kelas sekaligus format Excel"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Semua Kelas</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={onClearSubmissions}
                        className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Hapus semua riwayat sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset Data</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Filter Bar */}
              <div className="pt-3.5 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold pr-1">
                    <School className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Filter Kelas:</span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      id="filter-class-all"
                      type="button"
                      onClick={() => setSelectedClass('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedClass === 'all'
                          ? 'bg-[#12355b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>Semua Kelas</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedClass === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalAllStudents}
                      </span>
                    </button>

                    {classStats.map(([cls, count]) => (
                      <button
                        key={cls}
                        id={`filter-class-${cls.replace(/\s+/g, '-').toLowerCase()}`}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedClass === cls
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{cls}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          selectedClass === cls ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropdown Selector & Sort Indicator */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {classStats.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Pilihan:</span>
                      <select
                        id="select-class-dropdown"
                        aria-label="Pilih Kelas Ujian"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
                      >
                        <option value="all">Semua Kelas ({totalAllStudents} siswa)</option>
                        {classStats.map(([cls, count]) => (
                          <option key={cls} value={cls}>
                            Kelas {cls} ({count} siswa)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    id="toggle-sort-order-button"
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Klik untuk mengubah arah urutan nama siswa"
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <ArrowUpAZ className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    <span>Urutan: {sortOrder === 'asc' ? 'Nama A-Z' : 'Nama Z-A'}</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Notice */}
              {selectedClass !== 'all' && (
                <div className="mb-3 px-3.5 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in-50 duration-150">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      Menampilkan laporan rekapitulasi khusus: <strong>Kelas {selectedClass}</strong> ({filteredSubmissions.length} dari {totalAllStudents} siswa · Terurut A-Z)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClass('all')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tampilkan Semua Kelas</span>
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-12 text-slate-500 font-bold">No</th>
                      <th 
                        className="py-3 px-4 cursor-pointer hover:text-emerald-800 select-none transition-colors group"
                        onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                        title="Klik untuk membalik urutan (A-Z / Z-A)"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Nama Siswa</span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {sortOrder === 'asc' ? (
                              <ArrowDownAZ className="w-3 h-3" />
                            ) : (
                              <ArrowUpAZ className="w-3 h-3" />
                            )}
                            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                          </span>
                        </div>
                      </th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Token Acak</th>
                      <th className="py-3 px-4 text-center">Nilai CBT</th>
                      <th className="py-3 px-4 text-center">Jawaban Benar</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Integritas (Anti-Curang)</th>
                      <th className="py-3 px-4">Waktu Selesai</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody id="admin-table-body" className="divide-y divide-slate-100">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          {submissions.length === 0 ? (
                            'Belum ada data ujian siswa yang tersimpan. Siswa yang menyelesaikan ujian akan tampil otomatis di sini.'
                          ) : (
                            <div className="space-y-2">
                              <p>Tidak ditemukan siswa pada filter Kelas "{selectedClass}" atau kata kunci pencarian tersebut.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClass('all');
                                  setSearchStudent('');
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter & Tampilkan Semua</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3 text-center font-bold text-slate-400 text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {s.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {s.studentClass}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block font-mono text-xs font-bold text-[#12355b] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                              {s.token || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-block font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                                s.score >= currentKkm
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}>
                                {s.score}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                s.score >= currentKkm
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {s.score >= currentKkm ? 'Tuntas' : 'Remedial'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                            <span className="font-bold text-emerald-700">{s.correct}</span> / {s.totalActive}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Selesai
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {s.violations && s.violations.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(s)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Klik untuk memeriksa rincian waktu & jenis pelanggaran"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>{s.violations.length}x Curang</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Tertib</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {s.submittedAt}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(s)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#12355b] hover:bg-slate-100 transition-colors"
                                title="Lihat lembar jawaban detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteSubmission(s.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus rekaman ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Catatan: Data rekapitulasi tersimpan secara aman di penyimpanan lokal peramban Anda dan siap diekspor menjadi dokumen nilai CSV kapan saja.
              </p>
            </div>
          </section>
        ) : activeTab === 'questions' ? (
          <section id="questions-view">
            <QuestionBankView
              questions={questions}
              onToggleActive={onToggleQuestionActive}
              onActivateAll={onActivateAllQuestions}
              onImportQuestions={onImportQuestions}
              onResetQuestions={onResetQuestions}
              onDeleteQuestion={onDeleteQuestion}
            />
          </section>
        ) : activeTab === 'settings' ? (
          <section id="settings-view" className="space-y-6 pb-12">
            {/* Notification Toast */}
            {settingsMessage && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2.5 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <span>{settingsMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsMessage(null)}
                  className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Header Intro Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Konfigurasi Parameter Asesmen
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Pengaturan KKM & Durasi Waktu Ujian
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Kelola nilai Kriteria Ketuntasan Minimal (KKM) mata pelajaran Ekonomi serta batas alokasi waktu pengerjaan. Nilai konfigurasi ini langsung aktif pada lembar ujian siswa, Countdown Timer otomatis, kalkulasi ketuntasan rekapitulasi, dan dokumen ekspor CSV.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                  title="Kembalikan ke KKM 75 dan Waktu 30 Menit"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Standar Awal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>

            {/* 2-Column Settings Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: Pengaturan KKM */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Kriteria Ketuntasan Minimal (KKM)
                        </h3>
                        <span className="text-xs text-slate-400">Standar batas pencapaian kelulusan</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">KKM Aktif</span>
                      <span className="text-2xl font-black text-purple-700 font-mono">{kkmInput}</span>
                    </div>
                  </div>

                  {/* Input & Range Slider */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="kkm-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Batas Nilai KKM (Skala 0 - 100):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="kkm-input"
                          type="number"
                          min={10}
                          max={100}
                          value={kkmInput}
                          onChange={(e) => setKkmInput(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-xl font-mono font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-200 focus:border-purple-600 bg-slate-50 focus:bg-white text-center"
                        />
                        <div className="flex-1">
                          <input
                            type="range"
                            min={50}
                            max={95}
                            value={kkmInput}
                            onChange={(e) => setKkmInput(Number(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>50</span>
                            <span>70</span>
                            <span className="font-bold text-purple-700">75 (Standar)</span>
                            <span>80</span>
                            <span>95</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Pills */}
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-2">Pilihan Cepat Standar KKM:</span>
                      <div className="flex flex-wrap gap-2">
                        {[65, 70, 75, 78, 80, 85].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setKkmInput(val)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              kkmInput === val
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-800'
                            }`}
                          >
                            KKM {val} {val === 75 ? '(Standar)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Real-time simulation impact */}
                    <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-950 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>Simulasi Hasil Rekap Siswa:</span>
                        <span className="font-mono text-purple-800 font-black">{simulatedPassedCount} / {submissions.length} Tuntas ({simulatedPassRate}%)</span>
                      </div>
                      <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${simulatedPassRate}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-purple-800/80 leading-relaxed">
                        * Nilai <strong>≥ {kkmInput}</strong> berstatus <strong>TUNTAS</strong>. Nilai <strong>&lt; {kkmInput}</strong> berstatus <strong>REMEDIAL / BELUM TUNTAS</strong> ({submissions.length - simulatedPassedCount} siswa).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Diterapkan pada kartu ketuntasan, tabel rekap guru, lembar hasil siswa, dan kolom berkas CSV.</span>
                </div>
              </div>

              {/* CARD 2: Pengaturan Durasi Waktu */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Alokasi Waktu Pengerjaan Ujian
                        </h3>
                        <span className="text-xs text-slate-400">Durasi Countdown Timer sesi pengerjaan siswa</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Durasi</span>
                      <span className="text-2xl font-black text-emerald-700 font-mono">{durationInput} Menit</span>
                    </div>
                  </div>

                  {/* Input & Range Slider */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="duration-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Alokasi Waktu (Dalam Menit):
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="duration-input"
                          type="number"
                          min={5}
                          max={240}
                          value={durationInput}
                          onChange={(e) => setDurationInput(Math.max(5, Math.min(240, Number(e.target.value))))}
                          className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-xl font-mono font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 bg-slate-50 focus:bg-white text-center"
                        />
                        <div className="flex-1">
                          <input
                            type="range"
                            min={10}
                            max={120}
                            step={5}
                            value={durationInput}
                            onChange={(e) => setDurationInput(Number(e.target.value))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>10m</span>
                            <span className="font-bold text-emerald-700">30m (Std)</span>
                            <span>45m</span>
                            <span>60m</span>
                            <span>90m</span>
                            <span>120m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Pills */}
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-2">Pilihan Cepat Alokasi Sesi:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { min: 15, label: '15m (Kuis)' },
                          { min: 30, label: '30m (Standar)' },
                          { min: 45, label: '45m (Ulangan)' },
                          { min: 60, label: '60m (PTS)' },
                          { min: 90, label: '90m (PAS/PAT)' },
                        ].map((item) => (
                          <button
                            key={item.min}
                            type="button"
                            onClick={() => setDurationInput(item.min)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              durationInput === item.min
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Countdown Timer Preview */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>Tampilan Countdown Timer Siswa:</span>
                        <span className="font-mono text-emerald-900 font-black text-sm bg-white px-2.5 py-0.5 rounded border border-emerald-200 shadow-xs">
                          {String(durationInput).padStart(2, '0')}:00 WIB
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                        Timer menghitung mundur otomatis dari <strong>{durationInput} menit ({durationInput * 60} detik)</strong>. Peringatan visual otomatis muncul saat sisa 5 menit dan 1 menit. Jika waktu habis, sistem otomatis melakukan auto-submit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Berlaku otomatis untuk semua sesi pengerjaan ujian siswa selanjutnya.</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Pengaturan Keamanan & Anti-Curang Lengkap (Proctoring Guard) */}
            <div id="anti-cheat-settings-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    antiCheatInput.enabled ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {antiCheatInput.enabled ? <ShieldAlert className="w-6 h-6" /> : <ShieldOff className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">
                        Sistem Pengawas & Anti-Curang Ujian (CBT Proctoring)
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        antiCheatInput.enabled ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {antiCheatInput.enabled ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cegah kecurangan selama ujian berlangsung dengan pengawasan perpindahan tab, blokir copy-paste, dan pembatasan devtools.
                    </p>
                  </div>
                </div>

                {/* Master Switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={antiCheatInput.enabled}
                    onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-13 h-7 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-700">
                    {antiCheatInput.enabled ? 'Pengawas Berjalan' : 'Nonaktifkan Semua'}
                  </span>
                </label>
              </div>

              {antiCheatInput.enabled ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Grid Fitur Anti-Curang */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Block Tab Switch */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.blockTabSwitch ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Deteksi Pindah Tab & Jendela Blur
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Mencatat pelanggaran dan memunculkan peringatan layar penuh jika peserta berpindah tab atau membuka aplikasi lain di luar browser CBT.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.blockTabSwitch}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, blockTabSwitch: e.target.checked }))}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 2. Enforce Fullscreen */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.enforceFullscreen ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Wajib Mode Layar Penuh (Fullscreen)
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Mengharuskan siswa tetap dalam tampilan fullscreen. Keluar dari fullscreen akan langsung dicatat sebagai pelanggaran ujian.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.enforceFullscreen}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, enforceFullscreen: e.target.checked }))}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 3. Disable Copy & Paste */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.disableCopyPaste ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Blokir Salin-Tempel (Copy, Cut, Paste)
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Mencegah teks naskah soal disalin ke mesin pencari atau aplikasi AI dan mematikan fungsi seleksi teks.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.disableCopyPaste}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, disableCopyPaste: e.target.checked }))}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 4. Disable Right Click */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.disableRightClick ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Blokir Klik Kanan (Context Menu)
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Menonaktifkan menu klik kanan browser agar siswa tidak bisa mencari gambar di web atau mengakses menu bantuan.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.disableRightClick}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, disableRightClick: e.target.checked }))}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 5. Disable DevTools & Inspect */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.disableDevTools ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Blokir Developer Tools & View Source
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Memblokir tombol F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (source code), dan Ctrl+P (cetak dokumen).
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.disableDevTools}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, disableDevTools: e.target.checked }))}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 6. Randomize Questions Order */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.randomizeQuestions ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Acak Urutan Butir Soal per Siswa
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Setiap siswa akan mendapatkan urutan nomor soal yang berbeda-beda secara acak untuk meminimalisasi kerja sama antar meja.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.randomizeQuestions}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, randomizeQuestions: e.target.checked }))}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 7. Randomize Options Order */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      antiCheatInput.randomizeOptions ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            Acak Pilihan Jawaban (A, B, C, D, E)
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            Posisi pilihan A-E diacak per butir soal, sedangkan kunci jawaban tetap dipetakan dengan akurat ke opsi yang tepat.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={antiCheatInput.randomizeOptions}
                          onChange={(e) => setAntiCheatInput((prev) => ({ ...prev, randomizeOptions: e.target.checked }))}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toleransi Batas Pelanggaran & Konsekuensi */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Kebijakan & Toleransi Pelanggaran Siswa
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                      {/* Batas Maksimal */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-2">
                          Batas Maksimal Pelanggaran:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { count: 1, label: '1x (Ketat)' },
                            { count: 2, label: '2x' },
                            { count: 3, label: '3x (Standar Rekomendasi)' },
                            { count: 5, label: '5x (Toleran)' },
                            { count: 0, label: 'Tanpa Batas (Hanya Peringatan)' },
                          ].map((item) => (
                            <button
                              key={item.count}
                              type="button"
                              onClick={() => setAntiCheatInput((prev) => ({ ...prev, maxViolations: item.count }))}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                                antiCheatInput.maxViolations === item.count
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tindakan Saat Batas Tercapai */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-2">
                          Tindakan Saat Pelanggaran Mencapai Batas:
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-white cursor-pointer hover:border-slate-300">
                            <input
                              type="radio"
                              name="actionOnMaxViolations"
                              value="auto_submit"
                              checked={antiCheatInput.actionOnMaxViolations === 'auto_submit'}
                              onChange={() => setAntiCheatInput((prev) => ({ ...prev, actionOnMaxViolations: 'auto_submit' }))}
                              className="text-rose-600 focus:ring-rose-500"
                            />
                            <div>
                              <strong className="text-slate-800 block">Kumpulkan & Kunci Ujian Otomatis (Auto Submit)</strong>
                              <span className="text-[11px] text-slate-500">Ujian siswa langsung dihentikan dan lembar jawaban yang sudah terisi otomatis tersimpan.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-white cursor-pointer hover:border-slate-300">
                            <input
                              type="radio"
                              name="actionOnMaxViolations"
                              value="warn_only"
                              checked={antiCheatInput.actionOnMaxViolations === 'warn_only'}
                              onChange={() => setAntiCheatInput((prev) => ({ ...prev, actionOnMaxViolations: 'warn_only' }))}
                              className="text-rose-600 focus:ring-rose-500"
                            />
                            <div>
                              <strong className="text-slate-800 block">Peringatan Keras Saja (Tanpa Kunci)</strong>
                              <span className="text-[11px] text-slate-500">Siswa tetap dapat melanjutkan ujian, namun jumlah dan waktu pelanggaran tetap direkam di rekap guru.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Sistem anti-curang sedang dinonaktifkan. Siswa dapat berpindah tab, menggunakan devtools, dan urutan soal mengikuti urutan dokumen asli.</span>
                </div>
              )}
            </div>

            {/* CARD 4: Database Eksternal Google Spreadsheet & Apps Script */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#0f9d58] text-white shadow-sm shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-[#0f9d58] text-[11px] font-bold mb-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Backend Cloud Spreadsheet Tanpa Server
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Integrasi Google Sheets & Google Apps Script
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Hubungkan CBT ini langsung dengan Google Spreadsheet akun Google Drive Anda. Setiap siswa menyelesaikan ujian, nilai dan rincian jawaban otomatis terkirim tanpa server tambahan. Anda juga dapat menyinkronkan pengaturan KKM, durasi waktu, dan bank 30 soal.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buka Konfigurasi & Salin Script</span>
                </button>
              </div>
            </div>

            {/* CARD 4: Keamanan & Kredensial Akses Guru / Admin */}
            <div id="teacher-security-settings" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
              {/* Toast / Alert Status Kredensial */}
              {authSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{authSuccessMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthSuccessMessage(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {authErrorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{authErrorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthErrorMessage(null)}
                    className="text-rose-700 hover:text-rose-900 text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-blue-50 text-[#12355b] shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold mb-1">
                      <Lock className="w-3.5 h-3.5" /> Proteksi Akses Masuk
                    </div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      Keamanan Akun & Password Dashboard Guru
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                      Amankan Dashboard Guru agar tidak dapat dibuka oleh siswa. Anda dapat memperbarui username atau mengubah password default kapan saja.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-500">Username Aktif:</span>
                    <strong className="font-mono text-slate-800 font-bold">{teacherCreds.username}</strong>
                  </div>
                </div>
              </div>

              {/* Form Ganti Password */}
              <form onSubmit={handleSaveCredentials} className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username Guru
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      placeholder="Username guru (cth: endang8)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#12355b] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Default: endang8</span>
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Biarkan kosong jika tidak ganti"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#12355b] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showAuthPassword ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Default: kinanel123</span>
                  </div>

                  {/* Konfirmasi Password Baru */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Konfirmasi Password
                    </label>
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#12355b] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Wajib sama jika diubah</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Disimpan aman pada browser perangkat ini.</span>
                    {teacherCreds.lastUpdated && (
                      <span className="text-[11px] text-slate-400">
                        (Terakhir diubah: {new Date(teacherCreds.lastUpdated).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleResetCredentials}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset ke Bawaan</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#12355b] hover:bg-[#0b2745] text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Simpan Kredensial Baru</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Summary & Save Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Ringkasan Konfigurasi Baru
                  </h4>
                  <p className="text-xs text-slate-500">
                    Standar KKM: <strong className="text-purple-700">Nilai ≥ {kkmInput}</strong> · Alokasi Waktu: <strong className="text-emerald-700">{durationInput} Menit</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('recap')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Lihat Rekap Nilai
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section id="sheets-view" className="space-y-6 pb-12">
            {/* Header Intro Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0f9d58] text-xs font-bold mb-2">
                  <Database className="w-3.5 h-3.5" /> Cloud Spreadsheet Integration
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Backend Database Google Spreadsheet & Apps Script
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Jadikan Google Spreadsheet sebagai pusat penyimpanan cloud (backend) aplikasi CBT Ekonomi XII tanpa perlu menyewa server atau database berbayar.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buka Konfigurasi & Script</span>
                </button>
              </div>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0f9d58] flex items-center justify-center font-black mb-4">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    1. Pengiriman Nilai Real-Time
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setiap siswa yang menekan "Kumpulkan Jawaban" otomatis terkirim langsung ke baris baru spreadsheet sheet <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">Rekap_Nilai</code> lengkap dengan token, kelas, persentase nilai, dan waktu pengerjaan.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sheet: Rekap_Nilai</span>
                  <span className="font-semibold text-emerald-600">Otomatis / Real-Time</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12355b] flex items-center justify-center font-black mb-4">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    2. Sinkronisasi KKM & Waktu
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Konfigurasi KKM ({examSettings.kkm}) dan Durasi Ujian ({examSettings.durationMinutes} menit) dapat disimpan ke sheet <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">Pengaturan</code> atau dibaca ulang oleh sistem saat aplikasi dibuka.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sheet: Pengaturan</span>
                  <span className="font-semibold text-blue-600">2 Arah (Upload & Tarik)</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black mb-4">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    3. Cadangan 30 Bank Soal
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seluruh 30 naskah butir soal Ekonomi Kelas XII beserta pilihan opsi A-E dan kunci jawaban resmi tersimpan rapi di sheet <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700">Bank_Soal</code> sebagai arsip kurikulum sekolah.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sheet: Bank_Soal</span>
                  <span className="font-semibold text-purple-600">30 Butir Soal</span>
                </div>
              </div>
            </div>

            {/* Quick Action & Guide Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0f9d58]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Ingin Memasang atau Menguji Integrasi Sekarang?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Buka jendela integrasi untuk menyalin skrip Google Apps Script (Code.gs) dan menguji koneksi Web App URL Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('recap')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Kembali ke Rekap
                </button>
                <button
                  type="button"
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Buka Dialog Pengaturan</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Student Detail Modal */}
      {selectedSubmission && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Lembar Jawaban Siswa: {selectedSubmission.name}
                </h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
                  <span>{selectedSubmission.studentClass}</span>
                  <span>·</span>
                  <span>Token: <strong className="font-mono text-[#12355b]">{selectedSubmission.token || '-'}</strong></span>
                  <span>·</span>
                  <span>Nilai: <strong className="font-mono text-[#12355b]">{selectedSubmission.score}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    selectedSubmission.score >= currentKkm ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedSubmission.score >= currentKkm ? `TUNTAS (≥ KKM ${currentKkm})` : `BELUM TUNTAS (< KKM ${currentKkm})`}
                  </span>
                  <span>· ({selectedSubmission.correct} Benar, {selectedSubmission.wrong} Salah, {selectedSubmission.unanswered} Kosong)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1 text-xs">
              {/* Audit Log Pelanggaran Anti-Curang */}
              {selectedSubmission.violations && selectedSubmission.violations.length > 0 ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-rose-900 text-xs sm:text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Log Audit Integritas: {selectedSubmission.violations.length} Pelanggaran Terdeteksi</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-extrabold uppercase">
                      Pengawasan CBT
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Sistem mencatat aktivitas mencurigakan berikut selama siswa mengerjakan ujian:
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedSubmission.violations.map((v, vIdx) => (
                      <div key={vIdx} className="p-2 rounded-lg bg-white/90 border border-rose-100 flex items-start justify-between gap-2 text-[11px]">
                        <div className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <div>
                            <strong className="text-rose-900 capitalize block">
                              {v.type.replace(/_/g, ' ')}
                            </strong>
                            <span className="text-slate-600">{v.description}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                          {v.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Integritas Pengerjaan: Tertib & Bersih (Tidak ada pelanggaran terdeteksi)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Terverifikasi
                  </span>
                </div>
              )}

              {questions.filter((q) => q.active).map((q, idx) => {
                const ans = selectedSubmission.answers[q.id];
                const isCorrect = ans === q.answer;

                return (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700">No. {idx + 1} (Dok. #{q.id})</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        !ans ? 'bg-slate-200 text-slate-600' : isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {!ans ? 'Kosong' : isCorrect ? 'Benar (✓)' : `Salah (Pilih ${ans}, Kunci ${q.answer})`}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{q.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan & Pratinjau Unduh Format CSV */}
      {isExportModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Format & Pengaturan Unduh CSV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menghasilkan file CSV terstruktur rapi per baris dan per kolom untuk Microsoft Excel / Google Sheets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1 text-xs">
              {/* 1. Delimiter Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  1. Format Pemisah Kolom (Delimiter)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportDelimiter(';')}
                    className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      exportDelimiter === ';'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Pemisah Titik Koma ( ; )
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800 font-bold">
                        Excel Indonesia
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sesuai pengaturan regional Microsoft Excel di Indonesia. Setiap data langsung masuk ke kolom A, B, C secara otomatis tanpa menumpuk.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportDelimiter(',')}
                    className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      exportDelimiter === ','
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        Pemisah Koma ( , )
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        Google Sheets / RFC 4180
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Standar internasional untuk Google Spreadsheet, Apple Numbers, atau perangkat lunak berbasis format koma standar.
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Scope Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  2. Cakupan Data Siswa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportScope('current')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      exportScope === 'current'
                        ? 'border-[#12355b] bg-slate-50 text-slate-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs">
                      {selectedClass !== 'all' ? `Hanya Kelas ${selectedClass}` : 'Semua Kelas (Sesuai Filter)'}
                    </span>
                    <span className="text-[11px] font-normal text-slate-500 mt-0.5 block">
                      Mencakup {filteredSubmissions.length} siswa saat ini
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      exportScope === 'all'
                        ? 'border-[#12355b] bg-slate-50 text-slate-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="block text-xs">Seluruh Angkatan (Semua Kelas)</span>
                    <span className="text-[11px] font-normal text-slate-500 mt-0.5 block">
                      Mencakup total {totalAllStudents} siswa dari semua rombel
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Additional Rows & Summary Options */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  3. Tata Letak Baris Rekapitulasi
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeSummaryRows}
                      onChange={(e) => setIncludeSummaryRows(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-xs">
                      Sertakan baris ringkasan di bagian akhir (Rata-rata, Nilai Tertinggi/Terendah, & Jumlah Tuntas KKM)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeTitleBanner}
                      onChange={(e) => setIncludeTitleBanner(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-xs">
                      Sertakan judul laporan & tanggal unduh di baris paling atas
                    </span>
                  </label>
                </div>
              </div>

              {/* 4. Real Column Layout Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    4. Pratinjau Kolom & Baris yang Dihasilkan
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    UTF-8 BOM + CRLF Active
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto bg-white">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="px-2.5 py-1.5 border-r border-slate-200">No</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200">Nama Siswa</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200">Kelas</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200">Token</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Nilai</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Status KKM</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Benar</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Salah</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Kosong</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Total</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">% Ketepatan</th>
                        <th className="px-2.5 py-1.5 border-r border-slate-200 text-center">Pelanggaran</th>
                        <th className="px-2.5 py-1.5">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {(exportScope === 'all'
                        ? [...submissions].sort((a, b) => a.name.trim().localeCompare(b.name.trim(), 'id', { sensitivity: 'base' }))
                        : filteredSubmissions
                      ).slice(0, 5).map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-50">
                          <td className="px-2.5 py-1.5 font-bold border-r border-slate-200 text-slate-400">{idx + 1}</td>
                          <td className="px-2.5 py-1.5 font-semibold text-slate-800 border-r border-slate-200">{s.name}</td>
                          <td className="px-2.5 py-1.5 border-r border-slate-200">{s.studentClass}</td>
                          <td className="px-2.5 py-1.5 font-mono text-slate-500 border-r border-slate-200">{s.token || '-'}</td>
                          <td className="px-2.5 py-1.5 text-center font-bold text-[#12355b] border-r border-slate-200">{s.score}</td>
                          <td className="px-2.5 py-1.5 text-center border-r border-slate-200">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.score >= currentKkm ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {s.score >= currentKkm ? 'TUNTAS' : 'BELUM'}
                            </span>
                          </td>
                          <td className="px-2.5 py-1.5 text-center text-emerald-700 font-semibold border-r border-slate-200">{s.correct}</td>
                          <td className="px-2.5 py-1.5 text-center text-rose-600 font-semibold border-r border-slate-200">{s.wrong}</td>
                          <td className="px-2.5 py-1.5 text-center text-slate-400 border-r border-slate-200">{s.unanswered}</td>
                          <td className="px-2.5 py-1.5 text-center border-r border-slate-200">{s.totalActive}</td>
                          <td className="px-2.5 py-1.5 text-center font-mono border-r border-slate-200">
                            {s.totalActive > 0 ? `${((s.correct / s.totalActive) * 100).toFixed(1)}%` : '0%'}
                          </td>
                          <td className="px-2.5 py-1.5 text-center border-r border-slate-200">
                            {((s.violations?.length ?? s.violationCount ?? 0) > 0) ? (
                              <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                {s.violations?.length ?? s.violationCount}x
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">0</span>
                            )}
                          </td>
                          <td className="px-2.5 py-1.5 text-slate-500">{s.submittedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  * Menampilkan sampel data. Nilai tersimpan dengan standar RFC 4180 dan UTF-8 BOM agar tiap kolom dan baris terpisahkan secara rapi.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Pemisah: <strong>{exportDelimiter === ';' ? 'Titik Koma (Excel ID)' : 'Koma (Google Sheets)'}</strong> · Target: <strong>{exportScope === 'all' ? `${totalAllStudents} Siswa` : `${filteredSubmissions.length} Siswa`}</strong>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  id="modal-confirm-download-button"
                  type="button"
                  onClick={() => executeExportCSV()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Berkas CSV Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formal PDF Report with School Kop & Signature Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        submissions={submissions}
        selectedClass={selectedClass}
        kkm={currentKkm}
        durationMinutes={examSettings.durationMinutes}
      />

      {/* Google Sheets Cloud Backend Integration Modal */}
      <GoogleSheetsIntegrationModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        submissions={submissions}
        examSettings={examSettings}
        questions={questions}
        onSubmissionsImported={onSubmissionsImported}
      />
    </div>
  );
};
