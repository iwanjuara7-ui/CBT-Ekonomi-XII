import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Link2,
  Copy,
  Check,
  Download,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Code2,
  Settings2,
  X,
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { SubmissionRecord, ExamSettings, Question } from '../types';
import {
  GoogleSheetsConfig,
  getStoredSheetsConfig,
  saveStoredSheetsConfig,
  testSheetsConnection,
  syncAllSubmissionsToSheets,
  fetchSubmissionsFromSheets,
  syncSettingsToSheets,
  syncQuestionsToSheets
} from '../utils/googleSheetsService';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: SubmissionRecord[];
  onSubmissionsImported?: (imported: SubmissionRecord[]) => void;
  examSettings: ExamSettings;
  questions: Question[];
}

export const APPS_SCRIPT_SOURCE_CODE = `/**
 * =========================================================================================
 * BACKEND GOOGLE APPS SCRIPT - CBT UJIAN ONLINE EKONOMI KELAS XII
 * =========================================================================================
 * 1. Buka Google Spreadsheet baru (misal: "CBT EKONOMI KELAS XII").
 * 2. Buka menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus kode bawaan, tempelkan (paste) seluruh kode ini, lalu Simpan (Ctrl + S).
 * 4. Klik: Terapkan (Deploy) > Penerapan baru (New deployment).
 * 5. Pilih jenis: "Aplikasi web" (Web app).
 * 6. Set "Yang memiliki akses (Who has access)" ke: "Siapa saja (Anyone)" -> [PENTING]
 * 7. Klik Terapkan, beri otorisasi izin akun, lalu salin URL Web App (/exec).
 * =========================================================================================
 */

var SHEET_NAMES = {
  REKAP: 'Rekap_Nilai',
  PENGATURAN: 'Pengaturan',
  BANK_SOAL: 'Bank_Soal'
};

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'ping';

    if (action === 'ping') {
      return createJsonResponse({
        status: 'success',
        code: 200,
        message: 'Koneksi Backend Google Apps Script Berhasil Terhubung!',
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getSubmissions') {
      return handleGetSubmissions();
    }
    if (action === 'getSettings') {
      return handleGetSettings();
    }
    if (action === 'getQuestions') {
      return handleGetQuestions();
    }

    return createJsonResponse({ status: 'error', message: 'Aksi GET tidak valid: ' + action });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    var requestData = {};
    if (e && e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      requestData = e.parameter;
    }

    var action = requestData.action || 'submitExam';

    if (action === 'submitExam') {
      return handleSubmitExam(requestData.payload || requestData);
    }
    if (action === 'syncAllSubmissions') {
      return handleSyncAllSubmissions(requestData.payload || requestData);
    }
    if (action === 'updateSettings') {
      return handleUpdateSettings(requestData.payload || requestData);
    }
    if (action === 'syncQuestions') {
      return handleSyncQuestions(requestData.payload || requestData);
    }
    if (action === 'clearSubmissions') {
      return handleClearSubmissions();
    }

    return createJsonResponse({ status: 'error', message: 'Aksi POST tidak valid: ' + action });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleSubmitExam(data) {
  if (!data || !data.name) {
    return createJsonResponse({ status: 'error', message: 'Data peserta tidak lengkap.' });
  }

  var sheet = getOrCreateRekapSheet();
  var lastRow = sheet.getLastRow();
  var no = lastRow > 1 ? lastRow : 1;
  var kkm = data.kkm || 75;
  var isPassed = (data.score || 0) >= kkm ? 'TUNTAS' : 'BELUM TUNTAS';
  var percentage = data.totalActive > 0 ? ((data.correct / data.totalActive) * 100).toFixed(1) + '%' : '0%';
  var answerJson = typeof data.answers === 'object' ? JSON.stringify(data.answers) : (data.answers || '');

  var rowData = [
    no,
    new Date(),
    data.name,
    data.studentClass || '-',
    data.token || '-',
    data.score || 0,
    isPassed,
    data.correct || 0,
    data.wrong || 0,
    data.unanswered || 0,
    data.totalActive || 30,
    percentage,
    data.submittedAt || Utilities.formatDate(new Date(), 'Asia/Jakarta', 'HH:mm:ss'),
    answerJson
  ];

  sheet.appendRow(rowData);
  var newRowIndex = sheet.getLastRow();
  var range = sheet.getRange(newRowIndex, 1, 1, rowData.length);
  range.setFontFamily('Arial');
  range.setFontSize(10);
  range.setVerticalAlignment('middle');

  var statusCell = sheet.getRange(newRowIndex, 7);
  if (isPassed === 'TUNTAS') {
    statusCell.setFontColor('#047857');
    statusCell.setFontWeight('bold');
  } else {
    statusCell.setFontColor('#b91c1c');
    statusCell.setFontWeight('bold');
  }

  return createJsonResponse({
    status: 'success',
    message: 'Nilai siswa ' + data.name + ' berhasil disimpan ke Google Sheet.',
    student: data.name,
    score: data.score,
    kkmStatus: isPassed,
    rowNumber: newRowIndex
  });
}

function handleSyncAllSubmissions(payload) {
  var list = payload.submissions || payload;
  if (!Array.isArray(list)) {
    return createJsonResponse({ status: 'error', message: 'Submissions harus berupa array.' });
  }

  var sheet = getOrCreateRekapSheet();
  if (payload.clearExisting && sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  var kkm = payload.kkm || 75;
  var rowsToInsert = [];

  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    var isPassed = (s.score || 0) >= kkm ? 'TUNTAS' : 'BELUM TUNTAS';
    var percentage = s.totalActive > 0 ? ((s.correct / s.totalActive) * 100).toFixed(1) + '%' : '0%';
    var answerJson = typeof s.answers === 'object' ? JSON.stringify(s.answers) : (s.answers || '');

    rowsToInsert.push([
      i + 1,
      new Date(),
      s.name,
      s.studentClass || '-',
      s.token || '-',
      s.score || 0,
      isPassed,
      s.correct || 0,
      s.wrong || 0,
      s.unanswered || 0,
      s.totalActive || 30,
      percentage,
      s.submittedAt || '-',
      answerJson
    ]);
  }

  if (rowsToInsert.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
  }

  return createJsonResponse({
    status: 'success',
    message: 'Berhasil menyinkronkan ' + rowsToInsert.length + ' data siswa ke Google Sheet.',
    totalInserted: rowsToInsert.length
  });
}

function handleGetSubmissions() {
  var sheet = getOrCreateRekapSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return createJsonResponse({ status: 'success', count: 0, submissions: [] });
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  var submissions = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[2]) continue;

    var answersObj = {};
    try {
      if (row[13]) answersObj = JSON.parse(row[13]);
    } catch (e) {
      answersObj = {};
    }

    submissions.push({
      id: 'gsheet-' + (i + 1) + '-' + (row[4] || 'token'),
      name: String(row[2]),
      studentClass: String(row[3]),
      token: String(row[4]),
      score: Number(row[5]) || 0,
      correct: Number(row[7]) || 0,
      wrong: Number(row[8]) || 0,
      unanswered: Number(row[9]) || 0,
      totalActive: Number(row[10]) || 30,
      submittedAt: String(row[12] || '-'),
      answers: answersObj
    });
  }

  return createJsonResponse({ status: 'success', count: submissions.length, submissions: submissions });
}

function handleUpdateSettings(payload) {
  var sheet = getOrCreateSettingsSheet();
  var kkm = payload.kkm || 75;
  var duration = payload.durationMinutes || 30;

  var values = [
    ['KKM', kkm, 'Kriteria Ketuntasan Minimal', new Date()],
    ['DURASI_MENIT', duration, 'Alokasi waktu ujian dalam menit', new Date()],
    ['JUDUL_UJIAN', 'CBT Ekonomi XII - Akuntansi', 'Mata Pelajaran', new Date()],
    ['STATUS_SERVER', 'AKTIF', 'Status API CBT', new Date()]
  ];

  sheet.getRange(2, 1, values.length, 4).setValues(values);
  return createJsonResponse({ status: 'success', message: 'Pengaturan KKM dan Durasi diperbarui.', kkm: kkm, durationMinutes: duration });
}

function handleGetSettings() {
  var sheet = getOrCreateSettingsSheet();
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var settings = { kkm: 75, durationMinutes: 30 };

  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).toUpperCase();
    var val = data[i][1];
    if (key === 'KKM') settings.kkm = Number(val) || 75;
    if (key === 'DURASI_MENIT') settings.durationMinutes = Number(val) || 30;
  }

  return createJsonResponse({ status: 'success', settings: settings });
}

function handleSyncQuestions(payload) {
  var questions = payload.questions || payload;
  if (!Array.isArray(questions)) {
    return createJsonResponse({ status: 'error', message: 'Data questions harus berupa array.' });
  }

  var sheet = getOrCreateQuestionsSheet();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  var rows = [];
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var options = q.options || [];
    rows.push([
      q.id || (i + 1),
      q.material || '-',
      q.level || 'MOTS',
      q.text || '',
      options[0] || '',
      options[1] || '',
      options[2] || '',
      options[3] || '',
      q.answer || '',
      q.discussion || '',
      q.active ? 'AKTIF' : 'NONAKTIF'
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  return createJsonResponse({ status: 'success', message: 'Berhasil mengunggah ' + rows.length + ' nomor soal.', totalQuestions: rows.length });
}

function handleClearSubmissions() {
  var sheet = getOrCreateRekapSheet();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  return createJsonResponse({ status: 'success', message: 'Data nilai berhasil dibersihkan.' });
}

function getOrCreateRekapSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.REKAP);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.REKAP);
    var headers = ['No', 'Waktu Simpan Server', 'Nama Siswa', 'Kelas', 'Token', 'Nilai', 'Status KKM', 'Benar', 'Salah', 'Kosong', 'Total Soal', 'Ketepatan %', 'Waktu Pengumpulan', 'Rincian Jawaban JSON'];
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.PENGATURAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.PENGATURAN);
    var headers = ['Parameter', 'Nilai', 'Keterangan', 'Terakhir Diperbarui'];
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
    sheet.setFrozenRows(1);
    var defaultRows = [
      ['KKM', 75, 'Kriteria Ketuntasan Minimal Standar', new Date()],
      ['DURASI_MENIT', 30, 'Alokasi waktu pengerjaan dalam menit', new Date()],
      ['JUDUL_UJIAN', 'CBT Ekonomi XII - Akuntansi', 'Mata Pelajaran', new Date()],
      ['STATUS_SERVER', 'AKTIF', 'Status API CBT', new Date()]
    ];
    sheet.getRange(2, 1, defaultRows.length, 4).setValues(defaultRows);
  }
  return sheet;
}

function getOrCreateQuestionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.BANK_SOAL);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.BANK_SOAL);
    var headers = ['No', 'Materi', 'Level Kognitif', 'Teks Soal', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Kunci Jawaban', 'Pembahasan', 'Status'];
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground('#12355b');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsIntegrationModalProps> = ({
  isOpen,
  onClose,
  submissions,
  onSubmissionsImported,
  examSettings,
  questions,
}) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>(getStoredSheetsConfig);
  const [urlInput, setUrlInput] = useState<string>(config.webAppUrl);
  const [autoSync, setAutoSync] = useState<boolean>(config.autoSyncSubmissions);

  const [activeSubTab, setActiveSubTab] = useState<'config' | 'code' | 'tutorial'>('config');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    spreadsheetName?: string;
  } | null>(null);

  const [isSyncingSubmissions, setIsSyncingSubmissions] = useState<boolean>(false);
  const [isPullingSubmissions, setIsPullingSubmissions] = useState<boolean>(false);
  const [isSyncingSettings, setIsSyncingSettings] = useState<boolean>(false);
  const [isSyncingQuestions, setIsSyncingQuestions] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const current = getStoredSheetsConfig();
    setConfig(current);
    setUrlInput(current.webAppUrl);
    setAutoSync(current.autoSyncSubmissions);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    const updated: GoogleSheetsConfig = {
      ...config,
      webAppUrl: urlInput.trim(),
      autoSyncSubmissions: autoSync,
    };
    setConfig(updated);
    saveStoredSheetsConfig(updated);
    setActionNotice({ type: 'success', message: 'Konfigurasi Google Sheets berhasil disimpan!' });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTestConnection = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setTestResult({ success: false, message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSheetsConnection(cleanUrl);
      setTestResult(result);
      if (result.success) {
        const updated: GoogleSheetsConfig = {
          ...config,
          webAppUrl: cleanUrl,
          autoSyncSubmissions: autoSync,
          lastConnectedAt: new Date().toLocaleString('id-ID'),
          spreadsheetName: result.spreadsheetName,
          spreadsheetUrl: result.spreadsheetUrl,
        };
        setConfig(updated);
        saveStoredSheetsConfig(updated);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Gagal menguji koneksi.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAllSubmissionsNow = async () => {
    if (!config.webAppUrl) {
      setActionNotice({ type: 'error', message: 'Silakan hubungkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsSyncingSubmissions(true);
    setActionNotice(null);
    try {
      const res = await syncAllSubmissionsToSheets(submissions, examSettings.kkm, true, config.webAppUrl);
      if (res.success) {
        setActionNotice({ type: 'success', message: `Berhasil mengunggah ${submissions.length} rekaman siswa ke Google Spreadsheet!` });
      } else {
        setActionNotice({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err?.message || 'Gagal mengirim data.' });
    } finally {
      setIsSyncingSubmissions(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handlePullSubmissionsFromSheet = async () => {
    if (!config.webAppUrl) {
      setActionNotice({ type: 'error', message: 'Silakan hubungkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsPullingSubmissions(true);
    setActionNotice(null);
    try {
      const res = await fetchSubmissionsFromSheets(config.webAppUrl);
      if (res.success && res.data) {
        if (onSubmissionsImported) {
          onSubmissionsImported(res.data);
        }
        setActionNotice({ type: 'success', message: `Berhasil menarik ${res.data.length} rekaman nilai dari Google Spreadsheet!` });
      } else {
        setActionNotice({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err?.message || 'Gagal menarik data.' });
    } finally {
      setIsPullingSubmissions(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleSyncSettingsToSheet = async () => {
    if (!config.webAppUrl) {
      setActionNotice({ type: 'error', message: 'Silakan hubungkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsSyncingSettings(true);
    setActionNotice(null);
    try {
      const res = await syncSettingsToSheets(examSettings, config.webAppUrl);
      setActionNotice({ type: res.success ? 'success' : 'error', message: res.message });
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err?.message || 'Gagal menyinkronkan pengaturan.' });
    } finally {
      setIsSyncingSettings(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleSyncQuestionsToSheet = async () => {
    if (!config.webAppUrl) {
      setActionNotice({ type: 'error', message: 'Silakan hubungkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsSyncingQuestions(true);
    setActionNotice(null);
    try {
      const res = await syncQuestionsToSheets(questions, config.webAppUrl);
      setActionNotice({ type: res.success ? 'success' : 'error', message: res.message });
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err?.message || 'Gagal mengunggah bank soal.' });
    } finally {
      setIsSyncingQuestions(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const isConnected = !!config.webAppUrl && testResult?.success !== false;

  return (
    <div
      id="google-sheets-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0f9d58] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  Backend Database Google Spreadsheet & Apps Script
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  Cloud Free Tier
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Hubungkan CBT ke Google Spreadsheet pribadi Anda untuk pencatatan nilai real-time tanpa database berbayar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('config')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'config'
                ? 'border-[#0f9d58] text-[#0f9d58]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Pengaturan Koneksi & Sinkronisasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('code')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'code'
                ? 'border-[#0f9d58] text-[#0f9d58]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Salin Kode Apps Script (Code.gs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tutorial')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'tutorial'
                ? 'border-[#0f9d58] text-[#0f9d58]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Pasang 4 Langkah</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
          {/* Action Notice Alert */}
          {actionNotice && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
          )}

          {/* TAB 1: PENGATURAN & SINKRONISASI */}
          {activeSubTab === 'config' && (
            <div className="space-y-6">
              {/* Status Header Box */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  config.webAppUrl
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl text-white mt-0.5 ${
                      config.webAppUrl ? 'bg-[#0f9d58]' : 'bg-amber-500'
                    }`}
                  >
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base">
                        {config.webAppUrl
                          ? 'Terhubung dengan Google Apps Script'
                          : 'Belum Terhubung ke Google Spreadsheet'}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          config.webAppUrl
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {config.webAppUrl ? 'AKTIF' : 'OFFLINE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {config.spreadsheetName ? (
                        <>
                          Nama Spreadsheet: <strong>{config.spreadsheetName}</strong>
                          {config.lastConnectedAt && ` · Terakhir diuji: ${config.lastConnectedAt}`}
                        </>
                      ) : config.webAppUrl ? (
                        'URL Web App terpasang. Nilai ujian dapat disinkronkan secara otomatis.'
                      ) : (
                        'Ikuti panduan pada tab "Panduan Pasang" untuk membuat API Apps Script gratis.'
                      )}
                    </p>
                  </div>
                </div>

                {config.spreadsheetUrl && (
                  <a
                    href={config.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Form Input URL */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="sheets-webapp-url" className="block text-xs font-bold text-slate-900">
                    URL Aplikasi Web Google Apps Script (Web App URL):
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="sheets-webapp-url"
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-hidden focus:border-[#0f9d58] focus:ring-1 focus:ring-[#0f9d58]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting || !urlInput.trim()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menguji...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Uji Koneksi</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        className="px-4 py-2 bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    * Diperoleh setelah menerapkan kode sebagai Aplikasi Web dengan akses "Siapa saja (Anyone)".
                  </span>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Auto Sync Toggle */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-800 block">
                      Kirim Otomatis Hasil Ujian Siswa (Real-time Auto Sync)
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      Setiap kali siswa menekan tombol "Selesaikan Ujian", nilai dan rincian jawabannya langsung tercatat ke baris Google Sheet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoSync;
                      setAutoSync(next);
                      saveStoredSheetsConfig({ ...config, autoSyncSubmissions: next });
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      autoSync ? 'bg-[#0f9d58]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={autoSync}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        autoSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Data Sync Operations Center */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#0f9d58]" />
                    Pusat Sinkronisasi Data Spreadsheet:
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {submissions.length} Data Rekap di Aplikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Action 1: Upload All Submissions */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <UploadCloud className="w-4 h-4 text-[#0f9d58]" />
                        <span>Kirim Rekap Nilai ke Google Sheet</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mengunggah {submissions.length} rekaman siswa saat ini ke lembar <code className="font-mono text-slate-700 font-bold">Rekap_Nilai</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncAllSubmissionsNow}
                      disabled={isSyncingSubmissions || !config.webAppUrl}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingSubmissions ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah Data...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Unggah Rekap Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 2: Pull Submissions from Sheet */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                        <DownloadCloud className="w-4 h-4 text-blue-600" />
                        <span>Tarik Nilai dari Google Sheet</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mengambil seluruh nilai siswa yang tersimpan di Google Sheet untuk ditampilkan pada Dashboard Guru.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePullSubmissionsFromSheet}
                      disabled={isPullingSubmissions || !config.webAppUrl}
                      className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPullingSubmissions ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menarik Data...</span>
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Tarik Data Masuk</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 3: Sync Exam Settings */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 transition-all flex flex-col justify-between space-y-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                        <Settings2 className="w-4 h-4 text-purple-600" />
                        <span>Sinkronkan Standar KKM & Durasi</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Memperbarui KKM aktif ({examSettings.kkm}) dan Durasi ({examSettings.durationMinutes} menit) ke lembar <code className="font-mono text-slate-700 font-bold">Pengaturan</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncSettingsToSheet}
                      disabled={isSyncingSettings || !config.webAppUrl}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingSettings ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyinkronkan...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Kirim Pengaturan ke Sheet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 4: Sync Question Bank */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#12355b] transition-all flex flex-col justify-between space-y-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 text-[#12355b] font-bold text-xs">
                        <BookOpen className="w-4 h-4 text-[#12355b]" />
                        <span>Cadangkan Bank Soal (30 Soal)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mengunggah {questions.length} butir soal, opsi A-D, kunci, dan pembahasan ke lembar <code className="font-mono text-slate-700 font-bold">Bank_Soal</code>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncQuestionsToSheet}
                      disabled={isSyncingQuestions || !config.webAppUrl}
                      className="w-full py-2 bg-[#12355b] hover:bg-[#0c243f] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingQuestions ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah Bank Soal...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Unggah Bank Soal ke Sheet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALIN KODE APPS SCRIPT */}
          {activeSubTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs">
                <div>
                  <strong className="text-emerald-950 font-bold block text-sm">
                    Kode Lengkap Google Apps Script (Code.gs)
                  </strong>
                  <p className="text-emerald-800 mt-0.5">
                    Salin seluruh kode di bawah ini lalu tempelkan pada editor Apps Script di Google Spreadsheet Anda.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode Apps Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-200 font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Code.gs (Backend Restful API)
                  </span>
                  <span>~400 baris kode</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[380px] leading-relaxed text-[11px] text-slate-300">
                  <code>{APPS_SCRIPT_SOURCE_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN LANGKAH PEMASANGAN */}
          {activeSubTab === 'tutorial' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-sm font-bold block">
                    Cara Menghubungkan CBT dengan Google Spreadsheet dalam 2 Menit
                  </strong>
                  <p className="text-blue-800 mt-0.5">
                    Google Apps Script bertindak sebagai backend serverless gratis dari Google. Anda tidak perlu membayar server hosting atau database terpisah.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#12355b] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <strong className="text-slate-900 font-bold text-sm">Buat Spreadsheet Baru</strong>
                  </div>
                  <p className="text-slate-600">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> pada peramban Anda. Beri nama berkas, misalnya: <strong>"CBT EKONOMI XII - REKAP NILAI"</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#12355b] text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <strong className="text-slate-900 font-bold text-sm">Buka Apps Script & Tempel Kode</strong>
                  </div>
                  <p className="text-slate-600">
                    Di spreadsheet, klik menu <strong>Ekstensi (Extensions) &gt; Apps Script</strong>. Hapus isi default di berkas <code>Code.gs</code>, lalu tempel kode dari tab <em>"Salin Kode"</em>. Tekan Simpan (Ctrl+S).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <strong className="text-slate-900 font-bold text-sm">Terapkan sebagai Aplikasi Web</strong>
                  </div>
                  <p className="text-slate-600">
                    Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan baru</strong>. Pilih jenis <strong>Aplikasi web</strong>.
                    <br />
                    PENTING: Atur <em>"Yang memiliki akses"</em> ke <strong>"Siapa saja (Anyone)"</strong> agar siswa dapat mengirim nilai tanpa kendala login.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <strong className="text-slate-900 font-bold text-sm">Tempel URL di CBT & Uji Koneksi</strong>
                  </div>
                  <p className="text-slate-600">
                    Salin <strong>URL Aplikasi Web</strong> yang berakhir dengan <code>/exec</code>, tempelkan ke kolom URL di tab <em>"Pengaturan Koneksi"</em>, lalu klik <strong>Uji Koneksi</strong>. Selesai!
                  </p>
                </div>
              </div>

              {/* Security & Authorization Tip Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  Tips Otorisasi Akun Google Pertama Kali:
                </strong>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Saat pertama kali menerapkan, Google akan meminta konfirmasi izin. Jika muncul jendela peringatan <em>"Google belum memverifikasi aplikasi ini"</em>, klik tautan <strong>Lanjutan (Advanced)</strong> di bagian bawah, kemudian klik <strong>Buka CBT (tidak aman) / Go to project (unsafe)</strong>, lalu klik <strong>Izinkan (Allow)</strong>. Hal ini normal untuk script pribadi Anda sendiri.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Database: <strong>Google Spreadsheet Cloud (Gratis & Terpusat)</strong>
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {activeSubTab !== 'code' ? (
              <button
                type="button"
                onClick={() => setActiveSubTab('code')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Lihat Kode Apps Script</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 bg-[#0f9d58] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Kode</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
