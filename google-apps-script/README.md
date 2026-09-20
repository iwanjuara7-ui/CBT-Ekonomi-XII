# Panduan Backend Google Apps Script & Google Spreadsheet - CBT Ekonomi XII

Dokumen ini berisi panduan langkah demi langkah untuk menghubungkan aplikasi CBT Ujian Online Ekonomi Kelas XII dengan Google Spreadsheet pribadi Anda sebagai database cloud gratis dan terpusat.

---

## 1. Persiapan Spreadsheet Baru
1. Buka [Google Drive](https://drive.google.com/) atau [Google Spreadsheet](https://sheets.new/).
2. Buat spreadsheet baru dan beri nama, misalnya: **"CBT EKONOMI XII - REKAP NILAI"**.
3. Di dalam spreadsheet, buka menu atas: **Ekstensi (Extensions) > Apps Script**.

---

## 2. Pemasangan Kode Apps Script
1. Pada editor Apps Script yang terbuka, ganti seluruh isi berkas `Code.gs` dengan kode yang ada di berkas `Code.gs` proyek ini (atau salin langsung melalui tombol *Salin Kode* di Dashboard Guru).
2. Klik ikon **Simpan (Disket)** atau tekan `Ctrl + S` / `Cmd + S`.

---

## 3. Penerapan sebagai Aplikasi Web (Deployment)
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Terapkan (Deploy)** > **Penerapan baru (New deployment)**.
2. Klik ikon gerigi (roda gigi) di sebelah *Pilih jenis*, lalu pilih **Aplikasi web (Web app)**.
3. Atur konfigurasi berikut:
   - **Deskripsi**: `API CBT Nilai Siswa v1`
   - **Jalankan sebagai (Execute as)**: `Saya (email@gmail.com)`
   - **Yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(Sangat penting agar aplikasi CBT siswa dapat mengirimkan data nilai tanpa terkendala login akun)*.
4. Klik tombol **Terapkan (Deploy)**.
5. Google akan meminta otorisasi izin untuk mengakses Spreadsheet:
   - Klik **Beri akses (Authorize access)**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google belum memverifikasi aplikasi ini"*, klik **Lanjutan (Advanced)** di bawah, lalu klik **Buka (tidak aman) / Go to (unsafe)**.
   - Klik **Izinkan (Allow)**.
6. Salin **URL Aplikasi Web (Web App URL)** yang ditampilkan (berakhir dengan `/exec`).

---

## 4. Menghubungkan ke Aplikasi CBT
1. Masuk ke **Dashboard Guru** pada aplikasi CBT.
2. Klik tab **"Integrasi Google Sheet"** (atau ikon Google Drive/Spreadsheet).
3. Tempelkan URL Aplikasi Web ke dalam kolom input.
4. Klik tombol **"Uji Koneksi"**. Indikator hijau akan menyala jika terhubung.
5. Anda dapat mengaktifkan **"Kirim Otomatis Saat Siswa Selesai"**, mengunggah rekap nilai saat ini, atau menarik nilai yang sudah terkumpul di Google Sheet.

---

## Lembar yang Dibuat Otomatis oleh Script:
- **`Rekap_Nilai`**: No, Waktu Simpan, Nama Siswa, Kelas, Token, Nilai, Status KKM (Tuntas/Belum), Benar, Salah, Kosong, Total Soal, Ketepatan %, Waktu Pengumpulan, dan Jawaban Lengkap (JSON).
- **`Pengaturan`**: Parameter KKM dan Durasi Ujian.
- **`Bank_Soal`**: 30 nomor soal lengkap dengan kunci dan pembahasan.
