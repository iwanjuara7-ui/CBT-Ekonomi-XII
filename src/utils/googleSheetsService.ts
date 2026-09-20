import { SubmissionRecord, ExamSettings, Question } from '../types';

export const STORAGE_SHEETS_CONFIG_KEY = 'cbt_ekonomi_xii_google_sheets_config_v1';

export interface GoogleSheetsConfig {
  webAppUrl: string;
  autoSyncSubmissions: boolean;
  lastConnectedAt?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
}

export const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  webAppUrl: '',
  autoSyncSubmissions: true,
};

export function getStoredSheetsConfig(): GoogleSheetsConfig {
  try {
    const saved = localStorage.getItem(STORAGE_SHEETS_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SHEETS_CONFIG, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SHEETS_CONFIG;
}

export function saveStoredSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(STORAGE_SHEETS_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Uji koneksi ke endpoint Google Apps Script Web App
 */
export async function testSheetsConnection(webAppUrl: string): Promise<{
  success: boolean;
  message: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
}> {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script tidak valid. Pastikan diawali dengan https://script.google.com/...',
    };
  }

  const cleanUrl = webAppUrl.trim();
  const testUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=ping` : `${cleanUrl}?action=ping`;

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Koneksi gagal dengan status HTTP ${response.status}. Pastikan hak akses diatur ke "Siapa Saja / Anyone".`,
      };
    }

    const data = await response.json();
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message || 'Koneksi ke Google Apps Script berhasil!',
        spreadsheetName: data.spreadsheetName,
        spreadsheetUrl: data.spreadsheetUrl,
      };
    }

    return {
      success: false,
      message: data.message || 'Menerima respon dari script tetapi status gagal.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal menghubungi Google Apps Script: ${error?.message || 'CORS atau URL tidak dapat diakses'}. Pastikan penerapan berstatus Web App dengan akses "Anyone".`,
    };
  }
}

/**
 * Mengirim 1 hasil ujian siswa yang baru selesai ke Google Spreadsheet
 */
export async function sendSubmissionToSheets(
  submission: SubmissionRecord,
  kkm: number,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> {
  const url = webAppUrl || getStoredSheetsConfig().webAppUrl;
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  const payload = {
    action: 'submitExam',
    payload: {
      ...submission,
      kkm,
    },
  };

  try {
    // Use text/plain to avoid preflight OPTIONS request
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors', // Ensures write completes even if cross-origin redirect blocks reading
    });

    return {
      success: true,
      message: `Data siswa ${submission.name} berhasil dikirim ke Google Spreadsheet.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal mengirim nilai ke Google Sheets.',
    };
  }
}

/**
 * Mengirim seluruh data submissions (rekap semua kelas) ke Google Sheet
 */
export async function syncAllSubmissionsToSheets(
  submissions: SubmissionRecord[],
  kkm: number,
  clearExisting: boolean = true,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> {
  const url = webAppUrl || getStoredSheetsConfig().webAppUrl;
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  const payload = {
    action: 'syncAllSubmissions',
    payload: {
      submissions,
      kkm,
      clearExisting,
    },
  };

  try {
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: `Berhasil menyinkronkan ${submissions.length} rekaman siswa ke Google Spreadsheet.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menyinkronkan data ke Google Sheets.',
    };
  }
}

/**
 * Menarik data submissions dari Google Sheet ke aplikasi CBT
 */
export async function fetchSubmissionsFromSheets(
  webAppUrl?: string
): Promise<{ success: boolean; data?: SubmissionRecord[]; message: string }> {
  const url = webAppUrl || getStoredSheetsConfig().webAppUrl;
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  const cleanUrl = url.trim();
  const getUrl = cleanUrl.includes('?')
    ? `${cleanUrl}&action=getSubmissions`
    : `${cleanUrl}?action=getSubmissions`;

  try {
    const response = await fetch(getUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const result = await response.json();
    if (result.status === 'success' && Array.isArray(result.submissions)) {
      return {
        success: true,
        data: result.submissions,
        message: `Berhasil menarik ${result.submissions.length} rekaman dari Google Sheet.`,
      };
    }

    return {
      success: false,
      message: result.message || 'Gagal membaca data submissions dari Google Sheet.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menarik data dari Google Sheets.',
    };
  }
}

/**
 * Memperbarui pengaturan KKM & Durasi ke Google Sheet
 */
export async function syncSettingsToSheets(
  settings: ExamSettings,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> {
  const url = webAppUrl || getStoredSheetsConfig().webAppUrl;
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  const payload = {
    action: 'updateSettings',
    payload: settings,
  };

  try {
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: `Pengaturan (KKM ${settings.kkm}, Durasi ${settings.durationMinutes}m) disinkronkan ke Google Sheet.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menyinkronkan pengaturan ke Google Sheets.',
    };
  }
}

/**
 * Mengunggah seluruh bank soal ke Google Sheet
 */
export async function syncQuestionsToSheets(
  questions: Question[],
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> {
  const url = webAppUrl || getStoredSheetsConfig().webAppUrl;
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum dikonfigurasi.' };
  }

  const payload = {
    action: 'syncQuestions',
    payload: { questions },
  };

  try {
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: `Berhasil mengunggah ${questions.length} nomor bank soal ke Google Sheet.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal mengunggah bank soal ke Google Sheets.',
    };
  }
}
