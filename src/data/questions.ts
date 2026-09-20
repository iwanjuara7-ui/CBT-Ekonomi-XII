import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "LOTS",
    text: "Siapakah tokoh yang dijuluki sebagai \"Bapak Akuntansi Dunia\" karena buku karangannya memuat sistem pembukuan berpasangan (double entry system)?",
    options: [
      "Adam Smith",
      "David Ricardo",
      "Luca Pacioli",
      "John Maynard Keynes",
      "Alfred Marshall"
    ],
    answer: "C",
    discussion: "Luca Pacioli menerbitkan buku 'Summa de Arithmetica, Geometria, Proportioni et Proportionalita' pada tahun 1494 yang memuat bab khusus mengenai pembukuan berpasangan (Tractatus de Computis et Scripturis), sehingga dijuluki Bapak Akuntansi Dunia.",
    active: true
  },
  {
    id: 2,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "LOTS",
    text: "Organisasi profesi akuntan resmi di Indonesia yang didirikan pada tanggal 23 Desember 1957 adalah...",
    options: [
      "Ikatan Akuntan Indonesia (IAI)",
      "Institut Akuntan Publik Indonesia (IAPI)",
      "Ikatan Sarjana Ekonomi Indonesia (ISEI)",
      "Badan Pengawas Pasar Modal (BAPEPAM)",
      "Asosiasi Akuntan Indonesia (AAI)"
    ],
    answer: "A",
    discussion: "IAI (Ikatan Akuntan Indonesia) didirikan pada tanggal 23 Desember 1957 sebagai wadah organisasi profesi akuntan di Indonesia yang bertugas menyusun Standar Akuntansi Keuangan (SAK) dan kode etik akuntan.",
    active: true
  },
  {
    id: 3,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "LOTS",
    text: "Pihak eksternal perusahaan yang membutuhkan informasi akuntansi untuk menilai kemampuan perusahaan dalam membayar bunga dan melunasi utang pinjaman tepat waktu adalah...",
    options: [
      "Manajer produksi",
      "Investor / Calon investor",
      "Kreditor (Pihak Bank)",
      "Karyawan",
      "Pemegang saham"
    ],
    answer: "C",
    discussion: "Kreditor (bank atau lembaga pembiayaan) memerlukan laporan keuangan untuk menilai tingkat solvabilitas dan likuiditas perusahaan sebelum memberikan fasilitas pinjaman serta kepastian pengembaliannya.",
    active: true
  },
  {
    id: 4,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "LOTS",
    text: "Prinsip dasar akuntansi yang mengharuskan pencatatan aset atau barang yang dibeli berdasarkan harga perolehan sesungguhnya saat transaksi dinamakan...",
    options: [
      "Prinsip Entitas Ekonomi",
      "Prinsip Biaya Historis (Historical Cost)",
      "Prinsip Pengakuan Pendapatan",
      "Prinsip Konsistensi",
      "Prinsip Mempertemukan (Matching Principle)"
    ],
    answer: "B",
    discussion: "Prinsip Biaya Historis (Historical Cost Principle) mewajibkan setiap aktiva atau barang/jasa dicatat sebesar harga perolehan awal berdasarkan bukti transaksi yang sah dan dapat diverifikasi.",
    active: true
  },
  {
    id: 5,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "LOTS",
    text: "Profesi akuntan yang bekerja secara independen untuk memberikan jasa pemeriksaan (audit) laporan keuangan kepada publik dinamakan...",
    options: [
      "Akuntan Intern",
      "Akuntan Pemerintah",
      "Akuntan Publik",
      "Akuntan Pendidik",
      "Akuntan Manajemen"
    ],
    answer: "C",
    discussion: "Akuntan Publik adalah akuntan independen bersertifikasi yang mendirikan Kantor Akuntan Publik (KAP) untuk memberikan jasa audit, perpajakan, dan konsultasi keuangan kepada publik.",
    active: true
  },
  {
    id: 6,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "MOTS",
    text: "Perubahan sistem akuntansi di Indonesia dari Sistem Continental ke Sistem Anglo-Saxon pada era 1950-an disebabkan oleh...",
    options: [
      "Kewajiban dari pemerintah Kolonial Belanda sebelum meninggalkan Indonesia",
      "Dominasi penanaman modal asing (investasi) dan banyaknya lulusan perguruan tinggi dari Amerika Serikat",
      "Adanya instruksi langsung dari Ikatan Akuntan Indonesia (IAI)",
      "Ketidakmampuan Sistem Continental dalam mencatat transaksi perusahaan skala kecil",
      "Penerapan standar akuntansi tunggal dari PBB"
    ],
    answer: "B",
    discussion: "Masuknya investasi modal asing dari perusahaan-perusahaan multinasional (khususnya AS) serta kembalinya sarjana-sarjana ekonomi Indonesia lulusan Amerika Serikat mendorong pergeseran sistem pembukuan ke Anglo-Saxon.",
    active: true
  },
  {
    id: 7,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "MOTS",
    text: "Syarat kualitas informasi akuntansi yang menyatakan bahwa laporan keuangan harus bebas dari pengertian yang menyesatkan, kesalahan material, serta disajikan secara objektif dan jujur adalah...",
    options: [
      "Relevan",
      "Tepat Waktu",
      "Dapat Dipercaya (Reliabel)",
      "Dapat Dipahami",
      "Netral"
    ],
    answer: "C",
    discussion: "Reliabilitas (Dapat Dipercaya) menjamin bahwa data keuangan yang disajikan dapat diverifikasi, disajikan secara jujur (faithful representation), dan netral tanpa rekayasa angka.",
    active: true
  },
  {
    id: 8,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "MOTS",
    text: "Manakah kelompok bidang akuntansi berikut yang sesuai dengan perannya?",
    options: [
      "Akuntansi Keuangan – Menyajikan laporan keuangan untuk internal manajer",
      "Akuntansi Manajemen – Menyusun laporan keuangan untuk pihak perpajakan",
      "Akuntansi Biaya – Mengendalikan dan menganalisis biaya produksi manufaktur",
      "Akuntansi Pemeriksaan – Menentukan tarif pajak terutang perusahaan",
      "Akuntansi Anggaran – Memeriksa keabsahan bukti transaksi eksternal"
    ],
    answer: "C",
    discussion: "Akuntansi Biaya berfokus pada penetapan, pencatatan, dan pengendalian efisiensi biaya operasional, khususnya pada proses produksi barang di perusahaan manufaktur.",
    active: true
  },
  {
    id: 9,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "MOTS",
    text: "Serikat buruh/karyawan memerlukan informasi akuntansi perusahaan dengan tujuan utama untuk...",
    options: [
      "Mengetahui besarnya pajak yang ditanggung oleh perusahaan",
      "Menilai kemampuan perusahaan dalam memberikan kenaikan gaji, bonus, dan jaminan kesejahteraan",
      "Memperhitungkan tingkat pengembalian dividen tahunan",
      "Mengawasi kepatuhan manajer terhadap standar auditing",
      "Menentukan harga jual produk di pasaran"
    ],
    answer: "B",
    discussion: "Karyawan dan serikat pekerja membutuhkan informasi profitabilitas dan kelangsungan usaha (going concern) untuk menilai prospek karir, stabilitas pekerjaan, serta negosiasi hak kesejahteraan.",
    active: true
  },
  {
    id: 10,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "MOTS",
    text: "Apabila perusahaan memutuskan untuk menggunakan metode penyusutan aktiva tetap metode garis lurus (straight line method), maka perusahaan tersebut wajib menggunakannya pada periode-periode berikutnya. Hal ini sesuai dengan prinsip...",
    options: [
      "Prinsip Entitas Ekonomi",
      "Prinsip Konsistensi",
      "Prinsip Periodesitas",
      "Prinsip Materialitas",
      "Prinsip Pengungkapan Penuh"
    ],
    answer: "B",
    discussion: "Prinsip Konsistensi (Consistency) menuntut penggunaan kebijakan dan metode akuntansi yang sama dari tahun ke tahun agar laporan keuangan antarperiode dapat diperbandingkan secara valid.",
    active: true
  },
  {
    id: 11,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "HOTS",
    text: "Pak Deni adalah pemilik tunggal dari toko kelontong \"Maju Jaya\". Dalam bulan ini, beliau membayar cicilan mobil pribadinya sebesar Rp4.500.000,00 menggunakan uang yang ada di kasir toko dan mencatatnya sebagai Beban Operasional Toko. Analisis pelanggaran prinsip akuntansi yang terjadi pada kasus tersebut adalah...",
    options: [
      "Melanggar Historical Cost Principle karena kasir membiarkan uang keluar tanpa kuitansi resmi",
      "Melanggar Economic Entity Principle karena tidak memisahkan keuangan pribadi pemilik dengan keuangan entitas usaha",
      "Melanggar Matching Principle karena beban mobil tidak menghasilkan pendapatan bagi toko",
      "Melanggar Consistency Principle karena metode pembayaran berubah-ubah",
      "Melanggar Revenue Recognition Principle karena menurunkan nilai kas toko secara mendadak"
    ],
    answer: "B",
    discussion: "Prinsip Entitas Ekonomi (Economic Entity Principle) menegaskan bahwa perusahaan adalah entitas hukum dan keuangan yang berdiri sendiri terpisah dari urusan pribadi pemilik. Pengeluaran pribadi harus dicatat sebagai Prive, bukan beban usaha.",
    active: true
  },
  {
    id: 12,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "HOTS",
    text: "PT Nusantara menunda penyampaian laporan keuangan tahun 2024 hingga pertengahan tahun 2026 karena kendala audit internal. Ketika laporan tersebut diserahkan kepada para investor, nilai guna laporan tersebut sudah sangat berkurang. Kriteria kualitas informasi akuntansi yang terabaikan dalam kasus ini adalah...",
    options: [
      "Relevansi dan Tepat Waktu (Timeliness)",
      "Netralitas dan Keandalan",
      "Kelengkapan dan Materialitas",
      "Daya Banding dan Keterpahaman",
      "Aksesibilitas dan Transparansi"
    ],
    answer: "A",
    discussion: "Keterlambatan penyampaian laporan keuangan membuat informasi tersebut kehilangan faktor ketepatan waktu (timeliness), sehingga nilai relevansinya dalam pengambilan keputusan ekonomi saat ini menjadi berkurang secara signifikan.",
    active: true
  },
  {
    id: 13,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "HOTS",
    text: "Sebuah perusahaan jasa kontraktor telah menyelesaikan pengerjaan gedung senilai Rp500.000.000,00 pada tanggal 20 Desember 2025. Namun, pihak klien baru menyepakati pembayaran dilunasi pada tanggal 15 Januari 2026. Berdasarkan asas akrual (accrual basis), tindakan akuntan yang paling tepat pada laporan keuangan periode 31 Desember 2025 adalah...",
    options: [
      "Tidak mencatat transaksi sama sekali karena uang tunai belum diterima secara riil",
      "Mencatat pendapatan jasa senilai Rp500.000.000,00 dan Piutang Usaha pada laporan keuangan tahun 2025",
      "Mencatatnya sebagai Pendapatan Diterima di Muka (Unearned Revenue) pada liabilities",
      "Mengakui pendapatan penuh pada laporan keuangan tahun 2026 saat kas diterima",
      "Mencatat transaksi tersebut sebagai kerugian piutang ragu-ragu"
    ],
    answer: "B",
    discussion: "Di bawah basis akrual dan Prinsip Pengakuan Pendapatan, pendapatan diakui saat pekerjaan selesai atau hak atas tagihan timbul (Desember 2025) dengan mendebit Piutang Usaha dan mengkredit Pendapatan Jasa, bukan menunggu kas diterima.",
    active: true
  },
  {
    id: 14,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "HOTS",
    text: "Sebuah perusahaan manufaktur berencana meluncurkan lini produk baru dan membutuhkan analisis mengenai kalkulasi Break-Even Point (BEP), estimasi beban overhead, serta proyeksi anggaran operasional tahun depan. Jenis spesialisasi akuntansi dan profesi yang paling tepat ditugaskan untuk analisis ini adalah...",
    options: [
      "Akuntansi Keuangan oleh Akuntan Publik",
      "Akuntansi Pemeriksaan oleh Auditor Pemerintah",
      "Akuntansi Manajemen dan Akuntansi Biaya oleh Akuntan Intern (Manajemen)",
      "Akuntansi Perpajakan oleh Konsultan Pajak Eksternal",
      "Akuntansi Sektor Publik oleh Akuntan Pendidik"
    ],
    answer: "C",
    discussion: "Perencanaan produk baru, penetapan harga jual berdasarkan titik impas (BEP), dan kalkulasi beban overhead merupakan bidang Akuntansi Biaya dan Manajemen yang dijalankan oleh Akuntan Intern untuk pengambilan keputusan manajerial.",
    active: true
  },
  {
    id: 15,
    material: "Akuntansi sebagai Sistem Informasi",
    level: "HOTS",
    text: "Lembaga BPK (Badan Pemeriksa Keuangan) menemukan indikasi manipulasi angka laporan keuangan (cooking the books) pada proyek pembangunan infrastruktur instansi pemerintah. Profesi akuntan yang melakukan pengujian investigatif dan bidang akuntansi yang diterapkan pada kasus tersebut adalah...",
    options: [
      "Akuntan Publik – Akuntansi Keuangan",
      "Akuntan Pemerintah / Auditor Forensik – Akuntansi Sektor Publik / Pemeriksaan",
      "Akuntan Intern – Akuntansi Manajemen",
      "Akuntan Pendidik – Akuntansi Anggaran",
      "Konsultan Manajemen – Akuntansi Biaya"
    ],
    answer: "B",
    discussion: "Auditor di BPK atau BPKP merupakan Akuntan Pemerintah yang menerapkan Akuntansi Sektor Publik dan Pemeriksaan (Audit Investigatif/Forensik) untuk mendeteksi kecurangan (fraud) dalam penggunaan keuangan negara.",
    active: true
  },
  {
    id: 16,
    material: "Persamaan Dasar Akuntansi",
    level: "LOTS",
    text: "Rumus utama dari Persamaan Dasar Akuntansi yang menunjukkan keseimbangan antara kekayaan dan sumber pembiayaan perusahaan adalah...",
    options: [
      "Aset = Liabilitas - Ekuitas",
      "Aset = Liabilitas + Ekuitas",
      "Liabilitas = Aset + Ekuitas",
      "Ekuitas = Liabilitas - Aset",
      "Pendapatan = Aset + Beban"
    ],
    answer: "B",
    discussion: "Persamaan Dasar Akuntansi adalah Aset = Liabilitas + Ekuitas (Harta = Utang + Modal). Total kekayaan perusahaan selalu dibiayai oleh hak kreditor (liabilitas) dan hak pemilik (ekuitas).",
    active: true
  },
  {
    id: 17,
    material: "Persamaan Dasar Akuntansi",
    level: "LOTS",
    text: "Manakah dari akun-akun berikut yang dikelompokkan ke dalam Aset Lancar (Current Assets)?",
    options: [
      "Peralatan, Bangunan, dan Mesin",
      "Kas, Piutang Usaha, dan Perlengkapan",
      "Utang Usaha, Utang Bank, dan Modal",
      "Pendapatan Jasa dan Beban Gaji",
      "Hak Cipta dan Goodwill"
    ],
    answer: "B",
    discussion: "Aset lancar adalah harta yang berupa uang tunai atau yang dapat dicairkan/habis terpakai dalam siklus operasional normal (kurang dari 1 tahun), seperti Kas, Piutang Usaha, dan Perlengkapan.",
    active: true
  },
  {
    id: 18,
    material: "Persamaan Dasar Akuntansi",
    level: "LOTS",
    text: "Pengambilan aset perusahaan (uang tunai atau barang) oleh pemilik untuk kepentingan pribadi dinamakan...",
    options: [
      "Investasi",
      "Liabilitas",
      "Beban",
      "Prive (Withdrawal)",
      "Piutang"
    ],
    answer: "D",
    discussion: "Prive (Withdrawal) adalah penarikan dana atau aset perusahaan oleh pemilik untuk kepentingan pribadi, yang berakibat langsung mengurangi saldo ekuitas (modal).",
    active: true
  },
  {
    id: 19,
    material: "Persamaan Dasar Akuntansi",
    level: "LOTS",
    text: "Unsur yang akan mengurangi saldo Ekuitas (Modal) dalam persamaan dasar akuntansi adalah...",
    options: [
      "Investasi awal pemilik dan pendapatan",
      "Penerimaan piutang dan pembayaran utang",
      "Beban operasional dan prive",
      "Pembelian peralatan secara tunai",
      "Pinjaman uang dari bank"
    ],
    answer: "C",
    discussion: "Dalam persamaan diperluas: Ekuitas = Modal Awal + Pendapatan - Beban - Prive. Jadi unsur pengurang modal adalah Beban operasional dan Prive.",
    active: true
  },
  {
    id: 20,
    material: "Persamaan Dasar Akuntansi",
    level: "LOTS",
    text: "Apabila perusahaan menerima pendapatan jasa secara tunai, akun yang dipengaruhi secara langsung adalah...",
    options: [
      "Kas bertambah dan Utang bertambah",
      "Kas bertambah dan Ekuitas (Modal) bertambah",
      "Piutang bertambah dan Ekuitas bertambah",
      "Peralatan bertambah dan Kas berkurang",
      "Kas berkurang dan Ekuitas berkurang"
    ],
    answer: "B",
    discussion: "Penerimaan jasa tunai menambah aset (Kas) di sisi kiri persamaan, dan di sisi kanan pendapatan menambah Ekuitas (Modal) pemilik.",
    active: true
  },
  {
    id: 21,
    material: "Persamaan Dasar Akuntansi",
    level: "MOTS",
    text: "Perusahaan membeli peralatan salon secara kredit (berutang). Pengaruh transaksi tersebut terhadap persamaan dasar akuntansi adalah...",
    options: [
      "Kas berkurang dan Peralatan bertambah",
      "Peralatan bertambah dan Utang Usaha bertambah",
      "Peralatan bertambah dan Modal bertambah",
      "Perlengkapan bertambah dan Utang Usaha bertambah",
      "Peralatan bertambah dan Kas berkurang"
    ],
    answer: "B",
    discussion: "Peralatan (aset) bertambah di sisi kiri, dan Utang Usaha (liabilitas) bertambah di sisi kanan dalam nilai yang sama, sehingga persamaan tetap seimbang.",
    active: true
  },
  {
    id: 22,
    material: "Persamaan Dasar Akuntansi",
    level: "MOTS",
    text: "Telah diselesaikan jasa jahit pakaian senilai Rp1.500.000,00. Pelanggan baru membayar tunai sebesar Rp800.000,00 dan sisanya akan dilunasi bulan depan. Pengaruh transaksi tersebut terhadap persamaan dasar akuntansi adalah...",
    options: [
      "Kas bertambah Rp800.000,00, Piutang Usaha bertambah Rp700.000,00, dan Modal bertambah Rp1.500.000,00",
      "Kas bertambah Rp1.500.000,00 dan Modal bertambah Rp1.500.000,00",
      "Kas bertambah Rp800.000,00, Utang Usaha bertambah Rp700.000,00, dan Modal bertambah Rp1.500.000,00",
      "Piutang Usaha bertambah Rp1.500.000,00 dan Modal bertambah Rp1.500.000,00",
      "Kas bertambah Rp800.000,00 dan Modal berkurang Rp700.000,00"
    ],
    answer: "A",
    discussion: "Kas bertambah sebesar uang tunai yang diterima (Rp800.000,00), sisa tagihan menjadi Piutang Usaha (Rp700.000,00), dan total nilai jasa diakui sebagai pendapatan yang menambah Modal sebesar Rp1.500.000,00.",
    active: true
  },
  {
    id: 23,
    material: "Persamaan Dasar Akuntansi",
    level: "MOTS",
    text: "Suatu perusahaan membayar pelunasan utang usaha kepada kreditor. Dampak transaksi ini terhadap posisi keuangan perusahaan adalah...",
    options: [
      "Aset bertambah dan Liabilitas berkurang",
      "Aset berkurang dan Ekuitas berkurang",
      "Aset berkurang dan Liabilitas berkurang",
      "Liabilitas berkurang dan Ekuitas bertambah",
      "Aset berkurang dan Aset lain bertambah"
    ],
    answer: "C",
    discussion: "Pembayaran utang kas keluar menyebabkan Aset (Kas) berkurang, dan kewajiban kepada kreditor (Liabilitas) berkurang sebesar nominal yang dibayar.",
    active: true
  },
  {
    id: 24,
    material: "Persamaan Dasar Akuntansi",
    level: "MOTS",
    text: "Diketahui data posisi keuangan Bengkel \"Maju\": Total Aset = Rp50.000.000,00 dan Total Liabilitas (Utang) = Rp15.000.000,00. Berdasarkan rumus persamaan dasar akuntansi, berapakah besarnya Ekuitas (Modal) pemilik Bengkel \"Maju\"?",
    options: [
      "Rp65.000.000,00",
      "Rp50.000.000,00",
      "Rp35.000.000,00 (Ekuitas = Aset - Liabilitas)",
      "Rp25.000.000,00",
      "Rp15.000.000,00"
    ],
    answer: "C",
    discussion: "Berdasarkan Persamaan Dasar Akuntansi Aset = Liabilitas + Ekuitas, maka Ekuitas = Aset - Liabilitas = Rp50.000.000,00 - Rp15.000.000,00 = Rp35.000.000,00.",
    active: true
  },
  {
    id: 25,
    material: "Persamaan Dasar Akuntansi",
    level: "MOTS",
    text: "Perusahaan menerima pembayaran dari pelanggan atas jasa yang telah diselesaikan pada bulan lalu (pelunasan piutang). Pengaruhnya terhadap akun adalah...",
    options: [
      "Kas bertambah dan Modal bertambah",
      "Kas bertambah dan Piutang Usaha berkurang",
      "Kas bertambah dan Utang Usaha berkurang",
      "Piutang Usaha bertambah dan Modal berkurang",
      "Kas berkurang dan Piutang Usaha bertambah"
    ],
    answer: "B",
    discussion: "Penerimaan pelunasan piutang hanya mengubah komposisi aktiva: Kas bertambah dan Piutang Usaha berkurang dalam jumlah yang sama. Modal tidak berubah karena pendapatan sudah diakui di bulan sebelumnya saat jasa diselesaikan.",
    active: true
  },
  {
    id: 26,
    material: "Persamaan Dasar Akuntansi",
    level: "HOTS",
    text: "Pada usaha Laundry \"Resik\", diketahui saldo awal Modal, penerimaan pendapatan jasa, pembayaran beban operasional, serta penarikan dana prive pemilik. Rumus penentuan saldo Modal Akhir pada akhir periode yang tepat adalah...",
    options: [
      "Modal Akhir = Modal Awal + Pendapatan - Beban - Prive",
      "Modal Akhir = Modal Awal + Beban - Pendapatan + Prive",
      "Modal Akhir = Modal Awal - Prive + Beban",
      "Modal Akhir = Modal Awal + Pendapatan + Prive",
      "Modal Akhir = Modal Awal - Beban - Pendapatan"
    ],
    answer: "A",
    discussion: "Formula matematis pembentukan Modal Akhir pada persamaan akuntansi adalah: Modal Akhir = Modal Awal + Pendapatan Jasa - Beban Usaha - Prive.",
    active: true
  },
  {
    id: 27,
    material: "Persamaan Dasar Akuntansi",
    level: "HOTS",
    text: "Sebuah perusahaan rental mobil membeli armada kendaraan baru seharga Rp200.000.000,00. Perusahaan membayar uang muka sebesar Rp50.000.000,00 secara tunai, dan sisanya dibayar menggunakan pinjaman Bank. Analisis perubahan posisi keuangan yang tepat pada persamaan dasar akuntansi adalah...",
    options: [
      "Aset (Kendaraan) bertambah, Aset (Kas) berkurang, dan Liabilitas (Utang Bank) bertambah",
      "Aset (Kendaraan) bertambah dan Liabilitas bertambah penuh",
      "Aset (Kendaraan) bertambah, Aset (Kas) berkurang, dan Ekuitas berkurang",
      "Aset (Kendaraan) bertambah dan Aset (Kas) berkurang tanpa utang",
      "Aset (Kendaraan) bertambah dan Liabilitas berkurang"
    ],
    answer: "A",
    discussion: "Aset Kendaraan bertambah sebesar total harga perolehan (Rp200.000.000,00), Aset Kas berkurang sebesar uang muka tunai (Rp50.000.000,00), dan Liabilitas (Utang Bank) bertambah sebesar sisa kewajiban (Rp150.000.000,00).",
    active: true
  },
  {
    id: 28,
    material: "Persamaan Dasar Akuntansi",
    level: "HOTS",
    text: "Akuntan Toko \"Sentosa\" mencatat pembelian perlengkapan toko secara tunai dengan mengurangi Kas dan mengurangi Modal. Analisis dampak kesalahan pencatatan tersebut terhadap posisi persamaan dasar akuntansi adalah...",
    options: [
      "Total Aset dan Ekuitas tercatat seimbang, tidak ada masalah",
      "Total Aset menjadi understated dan Ekuitas tercatat lebih rendah dari yang seharusnya",
      "Peralatan tidak terdata sehingga utang perusahaan membengkak",
      "Kas tercatat lebih tinggi dan Modal lebih tinggi",
      "Persamaan akuntansi tetap seimbang tanpa memengaruhi laporan laba rugi"
    ],
    answer: "B",
    discussion: "Pembelian perlengkapan seharusnya mendebit Perlengkapan (aset bertambah) dan mengkredit Kas (aset berkurang), tanpa memengaruhi Modal. Kesalahan mengkredit modal menyebabkan ekuitas terlalu rendah (understated), dan tidak dicatatnya perlengkapan membuat total aset juga tercatat lebih rendah dari kondisi sesungguhnya.",
    active: true
  },
  {
    id: 29,
    material: "Persamaan Dasar Akuntansi",
    level: "HOTS",
    text: "Salon \"Ayu\" memiliki data akhir periode: Modal Awal Rp20.000.000,00, Total Aset Rp45.000.000,00, dan Total Liabilitas (Utang) Rp15.000.000,00. Jika pemilik tidak pernah mengambil prive dan tidak ada setoran modal tambahan, berapakah akumulasi Laba Bersih yang diperoleh Salon \"Ayu\"?",
    options: [
      "Rp10.000.000,00 (Laba Bersih = Modal Akhir - Modal Awal)",
      "Rp15.000.000,00",
      "Rp30.000.000,00",
      "Rp25.000.000,00",
      "Rp5.000.000,00"
    ],
    answer: "A",
    discussion: "Modal Akhir = Aset - Liabilitas = Rp45.000.000,00 - Rp15.000.000,00 = Rp30.000.000,00. Karena tidak ada prive, Laba Bersih = Modal Akhir - Modal Awal = Rp30.000.000,00 - Rp20.000.000,00 = Rp10.000.000,00.",
    active: true
  },
  {
    id: 30,
    material: "Persamaan Dasar Akuntansi",
    level: "HOTS",
    text: "Sebuah perusahaan cetak memperhitungkan pemakaian bahan perlengkapan cetak di akhir bulan. Dari saldo awal Perlengkapan sebesar Rp5.000.000,00, setelah dihitung fisik ternyata tersisa sebesar Rp2.000.000,00. Pencatatan penyesuaian pada persamaan dasar akuntansi yang tepat adalah...",
    options: [
      "Perlengkapan berkurang Rp3.000.000,00 dan Modal berkurang Rp3.000.000,00 (sebagai beban)",
      "Perlengkapan berkurang Rp2.000.000,00 dan Kas berkurang Rp2.000.000,00",
      "Kas berkurang Rp3.000.000,00 dan Perlengkapan bertambah Rp3.000.000,00",
      "Perlengkapan bertambah Rp2.000.000,00 dan Utang bertambah Rp2.000.000,00",
      "Modal bertambah Rp3.000.000,00 dan Perlengkapan berkurang Rp3.000.000,00"
    ],
    answer: "A",
    discussion: "Nilai perlengkapan yang terpakai = Saldo Awal - Sisa Fisik = Rp5.000.000,00 - Rp2.000.000,00 = Rp3.000.000,00. Pemakaian ini diakui sebagai Beban Perlengkapan yang mengurangi Perlengkapan (aset berkurang) dan mengurangi Modal dalam jumlah yang sama.",
    active: true
  }
];

export const EXAM_CONFIG = {
  defaultTokenPrefix: "AKM",
  durationMinutes: 30,
  subject: "Ekonomi",
  grade: "Kelas XII",
  topics: "Akuntansi sebagai Sistem Informasi & Persamaan Dasar Akuntansi",
};

export function generateRandomToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AKM-${randomCode}`;
}
