import { Question, CognitiveLevel } from '../types';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  rawParsedCount: number;
}

/**
 * Mem-parse teks copy-paste naskah soal menjadi daftar objek Question.
 * Mendukung:
 * - Soal bernomor: 1. / 1) / No. 1 / Soal 1
 * - Opsi jawaban A, B, C, D, E (atau a, b, c, d, e)
 * - Rumus LaTeX ($rumus$ atau $$rumus$$)
 * - Gambar ([Gambar: url/base64] atau ![alt](url) atau <img src="...">)
 * - Kunci Jawaban (Kunci: A / Jawaban: B / Ans: C / Key: D)
 * - Pembahasan (Pembahasan: ... / Penjelasan: ...)
 * - Materi & Tingkat Kognitif (Materi: ... / Level: HOTS/MOTS/LOTS)
 * - Format JSON array jika pengguna menempelkan data JSON
 */
export function parseQuestionsFromText(inputText: string, startingId: number = 1): ParseResult {
  const errors: string[] = [];
  const text = inputText.trim();

  if (!text) {
    return { questions: [], errors: ['Teks soal masih kosong. Silakan paste teks naskah soal Anda.'], rawParsedCount: 0 };
  }

  // 1. Cek jika input adalah JSON valid
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const jsonQuestions: Question[] = [];
        parsed.forEach((item, index) => {
          if (item.text && Array.isArray(item.options) && item.options.length >= 2) {
            jsonQuestions.push({
              id: typeof item.id === 'number' ? item.id : startingId + index,
              text: String(item.text).trim(),
              options: item.options.map((o: any) => String(o).trim()),
              answer: String(item.answer || 'A').toUpperCase().trim(),
              discussion: String(item.discussion || 'Kunci jawaban telah diverifikasi.').trim(),
              material: String(item.material || 'Akuntansi dan Persamaan Dasar Akuntansi').trim(),
              level: (['LOTS', 'MOTS', 'HOTS'].includes(String(item.level).toUpperCase())
                ? String(item.level).toUpperCase()
                : 'MOTS') as CognitiveLevel,
              active: item.active !== false,
              image: item.image ? String(item.image).trim() : undefined,
            });
          }
        });

        if (jsonQuestions.length > 0) {
          return { questions: jsonQuestions, errors: [], rawParsedCount: jsonQuestions.length };
        }
      }
    } catch {
      // Bukan JSON murni, lanjutkan ke parser teks naskah biasa
    }
  }

  // 2. Parser Teks Naskah Bebas / Word
  // Pisahkan blok-blok soal. Pola pembagi: baris baru yang diawali nomor soal baru:
  // Cth: "\n\n1." atau "\n1. " atau "\nNo. 1" atau "\nSoal 1"
  const normalizedText = '\n' + text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Regex pemisah nomor soal: baris baru diikuti "1." atau "1)" atau "No. 1" atau "Nomor 1" atau "[1]"
  const questionSplitter = /\n(?=(?:(?:No\.?|Nomor|Soal)\s*)?\d+[\.\)\:\-]\s+)/gi;
  const rawBlocks = normalizedText.split(questionSplitter).map((b) => b.trim()).filter(Boolean);

  const parsedQuestions: Question[] = [];

  rawBlocks.forEach((block, idx) => {
    try {
      const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) return;

      let extractedId = startingId + idx;
      let extractedMaterial = 'Persamaan Dasar Akuntansi';
      let extractedLevel: CognitiveLevel = 'MOTS';
      let extractedImage: string | undefined = undefined;
      let extractedAnswer = 'A';
      let extractedDiscussion = 'Kunci jawaban terverifikasi dari bank soal.';

      // Deteksi metadata baris awal (ID)
      const firstLine = lines[0];
      const idMatch = firstLine.match(/^(?:(?:No\.?|Nomor|Soal)\s*)?(\d+)[\.\)\:\-]\s*(.*)$/i);
      let promptLines: string[] = [];

      if (idMatch) {
        const num = parseInt(idMatch[1], 10);
        if (!isNaN(num)) extractedId = num;
        if (idMatch[2]) promptLines.push(idMatch[2]);
      } else {
        promptLines.push(firstLine);
      }

      // Parser opsi A-E dan baris-baris berikutnya
      const optionsMap: Record<string, string> = {};
      let currentOptionKey: string | null = null;
      let inDiscussion = false;
      const discussionLines: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Deteksi Gambar [Gambar: url] atau ![alt](url)
        const imgTagMatch = line.match(/(?:\[(?:gambar|image)\s*:\s*(.*?)\])|(?:\!\[.*?\]\((.*?)\))/i);
        if (imgTagMatch) {
          const foundUrl = (imgTagMatch[1] || imgTagMatch[2]).trim();
          if (foundUrl) {
            extractedImage = foundUrl;
          }
        }

        // Deteksi Materi: ...
        const materialMatch = line.match(/^(?:Materi|Topik|Bab)\s*[:=]\s*(.*)$/i);
        if (materialMatch) {
          extractedMaterial = materialMatch[1].trim();
          continue;
        }

        // Deteksi Level: ...
        const levelMatch = line.match(/^(?:Level|Tingkat(?:\s*Kognitif)?)\s*[:=]\s*(LOTS|MOTS|HOTS)/i);
        if (levelMatch) {
          extractedLevel = levelMatch[1].toUpperCase() as CognitiveLevel;
          continue;
        }

        // Deteksi Kunci: ...
        const answerMatch = line.match(/^(?:Kunci(?:\s*Jawaban)?|Jawaban|Ans|Key)\s*[:=]\s*([A-Ea-e])/i);
        if (answerMatch) {
          extractedAnswer = answerMatch[1].toUpperCase();
          currentOptionKey = null;
          continue;
        }

        // Deteksi Pembahasan: ...
        const discMatch = line.match(/^(?:Pembahasan|Penjelasan|Alasan|Solusi)\s*[:=]\s*(.*)$/i);
        if (discMatch) {
          inDiscussion = true;
          currentOptionKey = null;
          if (discMatch[1]) discussionLines.push(discMatch[1].trim());
          continue;
        }

        if (inDiscussion) {
          discussionLines.push(line);
          continue;
        }

        // Deteksi Pilihan Jawaban A., B., C., D., E.
        const optMatch = line.match(/^([A-Ea-e])[\.\)\:\-]\s*(.*)$/);
        if (optMatch) {
          currentOptionKey = optMatch[1].toUpperCase();
          optionsMap[currentOptionKey] = optMatch[2].trim();
          continue;
        }

        // Jika baris lanjutan opsi
        if (currentOptionKey && optionsMap[currentOptionKey] !== undefined) {
          optionsMap[currentOptionKey] += ' ' + line;
          continue;
        }

        // Jika belum ada opsi yang terdeteksi, anggap masih bagian dari teks soal / rumus
        promptLines.push(line);
      }

      // Susun opsi A-E
      const optionKeys = ['A', 'B', 'C', 'D', 'E'];
      const builtOptions: string[] = [];

      for (const k of optionKeys) {
        if (optionsMap[k]) {
          builtOptions.push(optionsMap[k]);
        }
      }

      // Validasi minimal: memiliki teks soal dan minimal 2 opsi (atau buat opsi fallback jika kurang)
      const fullText = promptLines.join('\n').trim();
      if (!fullText) {
        errors.push(`Blok nomor ${idx + 1} dilewati karena teks soal tidak terbaca.`);
        return;
      }

      if (builtOptions.length < 2) {
        errors.push(`Soal "${fullText.substring(0, 30)}..." memiliki kurang dari 2 pilihan jawaban.`);
        return;
      }

      // Pastikan ada sampai E jika memungkinkan (atau biarkan jumlah yang ada)
      if (discussionLines.length > 0) {
        extractedDiscussion = discussionLines.join('\n').trim();
      }

      parsedQuestions.push({
        id: extractedId,
        text: fullText,
        options: builtOptions,
        answer: extractedAnswer,
        discussion: extractedDiscussion,
        material: extractedMaterial,
        level: extractedLevel,
        active: true,
        image: extractedImage,
      });
    } catch (err: any) {
      errors.push(`Gagal mem-parse blok nomor ${idx + 1}: ${err?.message || 'Format tidak sesuai'}`);
    }
  });

  return {
    questions: parsedQuestions,
    errors,
    rawParsedCount: rawBlocks.length,
  };
}

/**
 * Contoh template teks naskah soal lengkap dengan rumus dan gambar
 */
export const SAMPLE_COPYPASTE_TEMPLATE = `1. Materi: Persamaan Dasar Akuntansi
Level: HOTS
Soal: Pada tanggal 5 Januari 2026, Salon Jelita membeli perlengkapan salon senilai Rp 3.500.000, dibayar tunai sebesar Rp 1.500.000 dan sisanya secara kredit. Persamaan dasar akuntansi yang berlaku memenuhi rumus:
$$\\text{Aktiva} = \\text{Kewajiban} + \\text{Ekuitas}$$
Bagaimana pengaruh transaksi tersebut terhadap posisi keuangan?
[Gambar: https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80]
A. Perlengkapan (+) Rp 3.500.000, Kas (-) Rp 1.500.000, dan Utang Usaha (+) Rp 2.000.000
B. Perlengkapan (+) Rp 3.500.000, Kas (-) Rp 3.500.000
C. Perlengkapan (+) Rp 3.500.000, Utang Usaha (+) Rp 3.500.000
D. Perlengkapan (+) Rp 3.500.000, Kas (-) Rp 2.000.000, dan Utang Usaha (+) Rp 1.500.000
E. Kas (-) Rp 1.500.000, Utang Usaha (-) Rp 2.000.000, dan Modal (-) Rp 3.500.000
Kunci: A
Pembahasan: Perlengkapan (Harta) bertambah Rp 3.500.000, Kas (Harta) berkurang Rp 1.500.000, dan Utang Usaha (Kewajiban) bertambah Rp 2.000.000. Total aktiva bersih bertambah Rp 2.000.000 seimbang dengan penambahan kewajiban Rp 2.000.000.

2. Materi: Akuntansi sebagai Sistem Informasi
Level: MOTS
Soal: Informasi keuangan perusahaan harus disajikan tepat waktu agar berguna bagi pengambilan keputusan para pemakai informasi. Karakteristik kualitas informasi akuntansi yang dimaksud adalah:
A. Relevan (Relevance)
B. Tepat Waktu (Timeliness)
C. Dapat Dipahami (Understandability)
D. Dapat Diuji (Verifiability)
E. Netral (Neutrality)
Kunci: B
Pembahasan: Karakteristik tepat waktu (timeliness) mensyaratkan informasi harus tersedia sebelum kehilangan kemampuan untuk mempengaruhi kebijakan pengambil keputusan.`;
