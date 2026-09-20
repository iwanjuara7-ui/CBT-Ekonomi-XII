import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolKopConfig, SubmissionRecord } from '../types';

export const DEFAULT_KOP_CONFIG: SchoolKopConfig = {
  provinceOffice: 'PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN',
  schoolName: 'SMA NEGERI 1 TELADAN',
  schoolAddress: 'Jalan Pendidikan No. 45, Telp. (021) 7890123, Laman: www.sman1teladan.sch.id',
  academicYear: '2025/2026',
  semester: 'Ganjil',
  teacherName: 'Dra. Hj. Siti Nurjanah, M.Pd.',
  teacherNip: '19760815 200312 2 003',
  principalName: 'Drs. H. Bambang Sudrajat, M.M.',
  principalNip: '19680324 199403 1 004',
  reportCity: 'Kota Pendidikan',
  reportDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
};

interface GeneratePdfOptions {
  submissions: SubmissionRecord[];
  kkm: number;
  durationMinutes: number;
  targetClass: string;
  kopConfig?: SchoolKopConfig;
}

export function generateExamReportPDF({
  submissions,
  kkm,
  durationMinutes,
  targetClass,
  kopConfig = DEFAULT_KOP_CONFIG,
}: GeneratePdfOptions): jsPDF {
  // Setup A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 14;

  // 1. KOP SURAT RESMI SEKOLAH
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(kopConfig.provinceOffice.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(18, 53, 91); // #12355b
  doc.text(kopConfig.schoolName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(kopConfig.schoolAddress, pageWidth / 2, currentY, { align: 'center' });
  currentY += 3.5;

  // Garis ganda resmi Kop Surat (tebal atas, tipis bawah)
  doc.setDrawColor(18, 53, 91);
  doc.setLineWidth(0.8);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 1.2;
  doc.setLineWidth(0.25);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // 2. JUDUL DOKUMEN LAPORAN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 53, 91);
  doc.text('LAPORAN HASIL ASESMEN SUMATIF BERBASIS KOMPUTER (CBT)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 50, 70);
  doc.text('MATA PELAJARAN EKONOMI KELAS XII', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Materi: Akuntansi sebagai Sistem Informasi & Persamaan Dasar Akuntansi', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  // 3. TABEL INFORMASI METADATA ASESMEN (2 Kolom)
  const metaLeft = marginLeft;
  const metaRight = pageWidth / 2 + 5;
  const classText = targetClass === 'all' ? 'Seluruh Kelas XII' : `Kelas ${targetClass}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Kolom Kiri
  doc.text(`Tahun Pelajaran / Smt  : ${kopConfig.academicYear} / ${kopConfig.semester}`, metaLeft, currentY);
  doc.text(`Sasaran Peserta / Kelas : ${classText}`, metaLeft, currentY + 4);
  doc.text(`Jumlah Peserta Ujian    : ${submissions.length} Siswa`, metaLeft, currentY + 8);

  // Kolom Kanan
  doc.text(`Kriteria Ketuntasan (KKM) : Nilai >= ${kkm}`, metaRight, currentY);
  doc.text(`Alokasi Waktu Pengerjaan  : ${durationMinutes} Menit`, metaRight, currentY + 4);
  doc.text(`Tanggal Cetak Dokumen     : ${kopConfig.reportDate}`, metaRight, currentY + 8);
  currentY += 12;

  // 4. TABEL NILAI SISWA DENGAN JSPDF-AUTOTABLE
  const tableData = submissions.map((s, idx) => {
    const isPassed = s.score >= kkm;
    const accuracy = s.totalActive > 0 ? ((s.correct / s.totalActive) * 100).toFixed(0) + '%' : '0%';
    return [
      idx + 1,
      s.name,
      s.studentClass || '-',
      s.token || '-',
      s.score,
      isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
      s.correct,
      s.wrong,
      s.unanswered,
      accuracy,
      s.submittedAt || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'No',
      'Nama Siswa',
      'Kelas',
      'Token',
      'Nilai',
      `Status (≥${kkm})`,
      'B',
      'S',
      'K',
      '%',
      'Waktu',
    ]],
    body: tableData,
    margin: { left: marginLeft, right: marginRight },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [18, 53, 91], // #12355b deep navy
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 }, // No
      1: { halign: 'left', fontStyle: 'bold' }, // Nama Siswa (flex)
      2: { halign: 'center', cellWidth: 18 }, // Kelas
      3: { halign: 'center', cellWidth: 16 }, // Token
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 12 }, // Nilai
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 24 }, // Status KKM
      6: { halign: 'center', cellWidth: 8 }, // Benar
      7: { halign: 'center', cellWidth: 8 }, // Salah
      8: { halign: 'center', cellWidth: 8 }, // Kosong
      9: { halign: 'center', cellWidth: 12 }, // %
      10: { halign: 'center', cellWidth: 18 }, // Waktu
    },
    didParseCell: (data) => {
      // Highlight Status KKM column
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'TUNTAS') {
          data.cell.styles.textColor = [4, 120, 87]; // Emerald-700
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [185, 28, 28]; // Red-700
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Highlight Nilai column
      if (data.section === 'body' && data.column.index === 4) {
        const scoreVal = Number(data.cell.raw);
        if (scoreVal >= kkm) {
          data.cell.styles.textColor = [18, 53, 91];
        } else {
          data.cell.styles.textColor = [180, 83, 9]; // Amber-700
        }
      }
    },
  });

  // Calculate position after table
  const lastAutoTable = (doc as any).lastAutoTable;
  let postTableY = lastAutoTable ? lastAutoTable.finalY + 6 : currentY + 50;

  // Check if we need a new page for summary & signatures to prevent clipping
  const requiredBottomSpace = 55;
  if (postTableY + requiredBottomSpace > 280) {
    doc.addPage();
    postTableY = 20;
  }

  // 5. KOTAK RINGKASAN STATISTIK EVALUASI
  if (submissions.length > 0) {
    const avg = (submissions.reduce((acc, curr) => acc + curr.score, 0) / submissions.length).toFixed(1);
    const max = Math.max(...submissions.map((s) => s.score));
    const min = Math.min(...submissions.map((s) => s.score));
    const passed = submissions.filter((s) => s.score >= kkm).length;
    const passedPct = Math.round((passed / submissions.length) * 100);

    doc.setFillColor(241, 245, 249); // Slate-100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginLeft, postTableY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(18, 53, 91);
    doc.text('RINGKASAN STATISTIK NILAI KELAS:', marginLeft + 4, postTableY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    const statText1 = `Rata-rata: ${avg}   |   Tertinggi: ${max}   |   Terendah: ${min}`;
    const statText2 = `Tuntas KKM (>=${kkm}): ${passed} siswa (${passedPct}%)   |   Belum Tuntas: ${submissions.length - passed} siswa`;
    doc.text(statText1, marginLeft + 4, postTableY + 8.5);
    doc.text(statText2, marginLeft + 4, postTableY + 12);

    postTableY += 20;
  }

  // Check page overflow again before signature block
  if (postTableY + 35 > 285) {
    doc.addPage();
    postTableY = 20;
  }

  // 6. LEMBAR PENGESAHAN / TANDA TANGAN FISIK (Kepala Sekolah & Guru Pengampu)
  const sigColLeft = marginLeft + 10;
  const sigColRight = pageWidth - marginRight - 60;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Kiri: Mengetahui Kepala Sekolah
  doc.text('Mengetahui,', sigColLeft, postTableY);
  doc.text('Kepala Sekolah', sigColLeft, postTableY + 4);

  // Kanan: Tempat, Tanggal & Guru Pengampu
  doc.text(`${kopConfig.reportCity}, ${kopConfig.reportDate}`, sigColRight, postTableY);
  doc.text('Guru Mata Pelajaran Ekonomi,', sigColRight, postTableY + 4);

  const sigNameY = postTableY + 22;

  // Nama & NIP Kepala Sekolah
  doc.setFont('helvetica', 'bold');
  doc.text(kopConfig.principalName, sigColLeft, sigNameY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIP. ${kopConfig.principalNip}`, sigColLeft, sigNameY + 3.5);

  // Nama & NIP Guru
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(kopConfig.teacherName, sigColRight, sigNameY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIP. ${kopConfig.teacherNip}`, sigColRight, sigNameY + 3.5);

  // 7. FOOTER NOMOR HALAMAN (Untuk setiap halaman)
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Dokumen Hasil Ujian CBT Ekonomi XII - Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadExamReportPDF(options: GeneratePdfOptions, filename?: string): void {
  const doc = generateExamReportPDF(options);
  const targetClassClean = options.targetClass === 'all' ? 'SEMUA_KELAS' : options.targetClass.replace(/\s+/g, '_');
  const finalFilename = filename || `Laporan_Hasil_Ujian_CBT_Ekonomi_XII_${targetClassClean}.pdf`;
  doc.save(finalFilename);
}
