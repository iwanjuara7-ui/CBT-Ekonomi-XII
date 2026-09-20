/**
 * =========================================================================================
 * BACKEND GOOGLE APPS SCRIPT - CBT UJIAN ONLINE EKONOMI KELAS XII
 * =========================================================================================
 * Script ini berfungsi sebagai API RESTful serverless untuk menghubungkan aplikasi CBT
 * dengan Google Spreadsheet secara real-time.
 * 
 * FITUR UTAMA:
 * 1. Penyimpanan otomatis nilai ujian siswa ke lembar 'Rekap_Nilai'.
 * 2. Pembuatan dan pemformatan header otomatis jika lembar belum tersedia.
 * 3. Sinkronisasi dua arah (Kirim & Tarik) data rekapitulasi ujian siswa.
 * 4. Pengaturan KKM dan Durasi Ujian pada lembar 'Pengaturan'.
 * 5. Sinkronisasi Bank Soal (30 nomor) ke lembar 'Bank_Soal'.
 * 
 * PETUNJUK PENERAPAN (DEPLOYMENT):
 * 1. Buka Google Spreadsheet baru di Google Drive Anda (misal: "CBT EKONOMI KELAS XII").
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus seluruh isi default pada Code.gs, lalu tempelkan (paste) seluruh kode ini.
 * 4. Klik ikon Disket (Save / Simpan).
 * 5. Klik tombol biru: Terapkan (Deploy) > Penerapan baru (New deployment).
 * 6. Pilih jenis: "Aplikasi web" (Web app).
 * 7. Konfigurasi penerapan:
 *    - Deskripsi : API CBT Ekonomi XII
 *    - Jalankan sebagai (Execute as) : Saya (akun Anda)
 *    - Yang memiliki akses (Who has access) : Siapa saja (Anyone) -> [PENTING]
 * 8. Klik "Terapkan" (Deploy), berikan izin otorisasi akses spreadsheet jika diminta.
 * 9. Salin URL Aplikasi Web (berakhiran /exec) dan masukkan ke Pengaturan di aplikasi CBT.
 * =========================================================================================
 */

// Nama-nama Sheet di Google Spreadsheet
var SHEET_NAMES = {
  REKAP: 'Rekap_Nilai',
  PENGATURAN: 'Pengaturan',
  BANK_SOAL: 'Bank_Soal'
};

/**
 * Endpoint HTTP GET: Untuk pengujian koneksi dan penarikan data (pull data)
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'ping';

    if (action === 'ping') {
      return createJsonResponse({
        status: 'success',
        code: 200,
        message: 'Koneksi Backend Google Apps Script CBT Ekonomi Berhasil Terhubung!',
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

    return createJsonResponse({
      status: 'error',
      message: 'Aksi GET tidak dikenali: ' + action
    });
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Endpoint HTTP POST: Untuk menerima pengiriman data (submit ujian, sync batch, update settings)
 */
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

    return createJsonResponse({
      status: 'error',
      message: 'Aksi POST tidak dikenali: ' + action
    });
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Menyimpan 1 lembar jawaban ujian siswa yang baru saja selesai
 */
function handleSubmitExam(data) {
  if (!data || !data.name) {
    return createJsonResponse({ status: 'error', message: 'Data peserta ujian tidak lengkap.' });
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

  // Format baris baru agar rapi
  var newRowIndex = sheet.getLastRow();
  var range = sheet.getRange(newRowIndex, 1, 1, rowData.length);
  range.setFontFamily('Arial');
  range.setFontSize(10);
  range.setVerticalAlignment('middle');

  // Format kolom nilai & status
  var statusCell = sheet.getRange(newRowIndex, 7);
  if (isPassed === 'TUNTAS') {
    statusCell.setFontColor('#047857'); // Hijau
    statusCell.setFontWeight('bold');
  } else {
    statusCell.setFontColor('#b91c1c'); // Merah
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

/**
 * Sinkronisasi seluruh data rekapitulasi nilai sekaligus dari aplikasi ke Google Sheet
 */
function handleSyncAllSubmissions(payload) {
  var list = payload.submissions || payload;
  if (!Array.isArray(list)) {
    return createJsonResponse({ status: 'error', message: 'Data submissions harus berupa array.' });
  }

  var sheet = getOrCreateRekapSheet();
  
  // Bersihkan data lama jika diminta
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

/**
 * Mengambil seluruh data nilai siswa dari Google Sheet untuk ditarik ke aplikasi
 */
function handleGetSubmissions() {
  var sheet = getOrCreateRekapSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return createJsonResponse({
      status: 'success',
      count: 0,
      submissions: []
    });
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  var submissions = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[2]) continue; // Skip jika nama kosong

    var answersObj = {};
    try {
      if (row[13]) {
        answersObj = JSON.parse(row[13]);
      }
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

  return createJsonResponse({
    status: 'success',
    count: submissions.length,
    submissions: submissions
  });
}

/**
 * Memperbarui Pengaturan KKM dan Durasi Ujian di Sheet 'Pengaturan'
 */
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

  return createJsonResponse({
    status: 'success',
    message: 'Pengaturan KKM (' + kkm + ') dan Durasi (' + duration + 'm) berhasil diperbarui di Google Sheet.',
    kkm: kkm,
    durationMinutes: duration
  });
}

/**
 * Mengambil Pengaturan KKM dan Durasi Ujian dari Sheet 'Pengaturan'
 */
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

  return createJsonResponse({
    status: 'success',
    settings: settings
  });
}

/**
 * Mengunggah 30 Bank Soal ke Sheet 'Bank_Soal'
 */
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

  return createJsonResponse({
    status: 'success',
    message: 'Berhasil mengunggah ' + rows.length + ' nomor bank soal ke Google Sheet.',
    totalQuestions: rows.length
  });
}

/**
 * Mengosongkan data nilai siswa pada sheet 'Rekap_Nilai'
 */
function handleClearSubmissions() {
  var sheet = getOrCreateRekapSheet();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  return createJsonResponse({
    status: 'success',
    message: 'Semua rekaman nilai ujian siswa berhasil dibersihkan dari Google Sheet.'
  });
}

// =========================================================================================
// FUNGSI PEMBANTU LEMBAR SPREADSHEET & PEMFORMATAN (AUTO INITIALIZE)
// =========================================================================================

function getOrCreateRekapSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.REKAP);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES.REKAP);
    var headers = [
      'No',
      'Waktu Simpan Server',
      'Nama Lengkap Siswa',
      'Kelas',
      'Token Ujian',
      'Nilai Akhir',
      'Status KKM',
      'Benar',
      'Salah',
      'Kosong',
      'Total Soal',
      'Ketepatan %',
      'Waktu Pengumpulan Siswa',
      'Rincian Jawaban JSON'
    ];
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
    var headers = [
      'No',
      'Materi',
      'Level Kognitif',
      'Teks Soal',
      'Opsi A',
      'Opsi B',
      'Opsi C',
      'Opsi D',
      'Kunci Jawaban',
      'Pembahasan',
      'Status'
    ];
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground('#12355b'); // Deep Navy khas CBT
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
