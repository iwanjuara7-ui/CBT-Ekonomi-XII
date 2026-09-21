import { Question, CheatViolation } from '../types';

/**
 * Mengacak array menggunakan algoritma Fisher-Yates shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Mempersiapkan soal untuk siswa dengan opsi acak butir soal dan acak pilihan jawaban
 */
export function prepareStudentQuestions(
  questions: Question[],
  randomizeQuestions: boolean,
  randomizeOptions: boolean
): Question[] {
  let processed = [...questions];

  // Acak urutan butir soal jika diaktifkan
  if (randomizeQuestions) {
    processed = shuffleArray(processed);
  }

  // Acak opsi jawaban (A, B, C, D, E) jika diaktifkan, dan sesuaikan kunci jawaban agar tetap valid
  if (randomizeOptions) {
    processed = processed.map((q) => {
      // Petakan opsi dengan status kunci jawaban awalnya
      const correctOptionIndex = q.answer.charCodeAt(0) - 65; // A -> 0, B -> 1, ...
      const correctOptionText = q.options[correctOptionIndex];

      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.findIndex((opt) => opt === correctOptionText);
      const newAnswerKey = String.fromCharCode(65 + (newCorrectIndex >= 0 ? newCorrectIndex : 0));

      return {
        ...q,
        options: shuffledOptions,
        answer: newAnswerKey,
      };
    });
  }

  return processed;
}

/**
 * Format timestamp waktu pelanggaran
 */
export function getViolationTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
