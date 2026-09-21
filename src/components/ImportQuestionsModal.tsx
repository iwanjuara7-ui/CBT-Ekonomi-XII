import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { parseQuestionsFromText, SAMPLE_COPYPASTE_TEMPLATE } from '../utils/questionParser';
import { FormattedContent } from './FormattedContent';
import { 
  FileUp, Copy, Check, AlertCircle, Sparkles, Image as ImageIcon, 
  HelpCircle, Trash2, ArrowRight, Eye, Code, Layers, RefreshCw, X, PlusCircle
} from 'lucide-react';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestionsCount: number;
  onImport: (importedQuestions: Question[], mode: 'append' | 'replace') => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  currentQuestionsCount,
  onImport,
}) => {
  const [activeMode, setActiveMode] = useState<'copypaste' | 'manual'>('copypaste');
  const [rawText, setRawText] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedPreview, setParsedPreview] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [hasParsed, setHasParsed] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Manual single-question state
  const [singleMaterial, setSingleMaterial] = useState('Persamaan Dasar Akuntansi');
  const [singleLevel, setSingleLevel] = useState<'LOTS' | 'MOTS' | 'HOTS'>('MOTS');
  const [singleText, setSingleText] = useState('');
  const [singleImage, setSingleImage] = useState('');
  const [singleOptions, setSingleOptions] = useState<string[]>(['', '', '', '', '']);
  const [singleAnswer, setSingleAnswer] = useState('A');
  const [singleDiscussion, setSingleDiscussion] = useState('');

  if (!isOpen) return null;

  // Tangani Paste langsung dari Clipboard (termasuk paste gambar screenshot/file gambar)
  const handlePasteInTextarea = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        // Ini adalah gambar dari screenshot clipboard (PrtScn / Snipping Tool)
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (base64) {
              const imageTag = `\n[Gambar: ${base64}]\n`;
              // Masukkan ke posisi kursor textarea
              const target = e.target as HTMLTextAreaElement;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const newText = rawText.substring(0, start) + imageTag + rawText.substring(end);
              setRawText(newText);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Parsing naskah saat tombol di klik atau live
  const handleParseText = () => {
    const startId = importMode === 'append' ? currentQuestionsCount + 1 : 1;
    const result = parseQuestionsFromText(rawText, startId);
    setParsedPreview(result.questions);
    setParseErrors(result.errors);
    setHasParsed(true);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_COPYPASTE_TEMPLATE);
    const result = parseQuestionsFromText(SAMPLE_COPYPASTE_TEMPLATE, importMode === 'append' ? currentQuestionsCount + 1 : 1);
    setParsedPreview(result.questions);
    setParseErrors(result.errors);
    setHasParsed(true);
  };

  const handleInsertFormula = (formulaText: string) => {
    setRawText((prev) => prev + `\n${formulaText}\n`);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleExecuteImport = () => {
    if (activeMode === 'copypaste') {
      if (parsedPreview.length === 0) {
        alert('Belum ada soal yang berhasil terbaca. Silakan klik tombol "Periksa & Pratinjau Soal" terlebih dahulu.');
        return;
      }
      onImport(parsedPreview, importMode);
      onClose();
    } else {
      // Manual single question mode
      if (!singleText.trim()) {
        alert('Teks soal tidak boleh kosong.');
        return;
      }
      const validOptions = singleOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        alert('Pilihan jawaban minimal harus terisi 2 opsi.');
        return;
      }

      const newQ: Question = {
        id: importMode === 'append' ? currentQuestionsCount + 1 : 1,
        material: singleMaterial,
        level: singleLevel,
        text: singleText.trim(),
        image: singleImage.trim() || undefined,
        options: singleOptions.map((o, idx) => o.trim() || `Pilihan ${String.fromCharCode(65 + idx)}`),
        answer: singleAnswer,
        discussion: singleDiscussion.trim() || 'Kunci jawaban terverifikasi guru.',
        active: true,
      };

      onImport([newQ], importMode);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0b2745] via-[#12355b] to-[#165d62] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-400 text-[#0b2745] font-extrabold shadow-md">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Import Cepat Soal CBT
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Import Soal dengan Copy-Paste Dokumen
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Mendukung rumus akuntansi/matematika LaTeX ($..$ &amp; $$..$$) dan gambar soal (Ctrl+V paste langsung atau URL).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector Mode Input */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('copypaste')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
                activeMode === 'copypaste'
                  ? 'bg-white text-[#12355b] border-slate-200 shadow-2xs font-black'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                <span>Bulk Copy-Paste Naskah Soal</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('manual')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
                activeMode === 'manual'
                  ? 'bg-white text-[#12355b] border-slate-200 shadow-2xs font-black'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>Form Input 1 Soal Baru</span>
              </span>
            </button>
          </div>

          {/* Pengaturan Mode Tambah / Timpa */}
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs font-semibold text-slate-500">Metode Import:</span>
            <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setImportMode('append');
                  setHasParsed(false);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  importMode === 'append' ? 'bg-white text-[#12355b] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Tambah (Append)
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMode('replace');
                  setHasParsed(false);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  importMode === 'replace' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timpa Semua (Replace)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeMode === 'copypaste' ? (
            <div className="space-y-5">
              {/* Quick Actions & Formatting Guide */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Paste naskah dari Word, PDF, atau Docs. Anda bisa langsung paste screenshot gambar (Ctrl+V) ke kotak teks.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Muat Contoh Format</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('');
                      setParsedPreview([]);
                      setHasParsed(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Quick Formulas Insert Helper Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Sisipkan Rumus Cepat:</span>
                {[
                  { label: 'Harta = Utang + Modal', formula: '$$Harta = Utang + Modal$$' },
                  { label: 'Aktiva = Kewajiban + Ekuitas', formula: '$$\\text{Aktiva} = \\text{Kewajiban} + \\text{Ekuitas}$$' },
                  { label: 'Laba = Pendapatan - Beban', formula: '$$\\Delta Modal = Pendapatan - Beban$$' },
                  { label: 'Tag Gambar [Gambar: URL]', formula: '[Gambar: https://...]' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertFormula(item.formula)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>

              {/* Textarea Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Tempelkan (Paste) Naskah Soal Anda di Sini:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {rawText ? `${rawText.split('\n').length} baris teks` : 'Format nomor, opsi A-E, kunci, dan pembahasan otomatis dideteksi'}
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onPaste={handlePasteInTextarea}
                  placeholder={`Contoh:\n1. Persamaan akuntansi yang tepat adalah:\n$$Aktiva = Pasiva$$\nA. Pilihan A\nB. Pilihan B\nC. Pilihan C\nD. Pilihan D\nE. Pilihan E\nKunci: A\nPembahasan: Pembahasan rinci...`}
                  rows={12}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#12355b] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden resize-y leading-relaxed"
                />
              </div>

              {/* Tombol Periksa / Parse */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={!rawText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#12355b] hover:bg-[#0b2745] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Periksa &amp; Pratinjau Soal ({parsedPreview.length ? `${parsedPreview.length} Soal Terbaca` : 'Klik untuk Uji'})</span>
                </button>

                {hasParsed && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{parsedPreview.length} butir soal siap dimasukkan ke Bank Soal</span>
                  </span>
                )}
              </div>

              {/* Error messages if any */}
              {parseErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Peringatan Format:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Preview List */}
              {hasParsed && parsedPreview.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Hasil Pratinjau Naskah ({parsedPreview.length} Soal)</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      Mulai dari nomor {parsedPreview[0]?.id} sampai {parsedPreview[parsedPreview.length - 1]?.id}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {parsedPreview.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#12355b] text-white flex items-center justify-center text-xs font-black">
                              {q.id}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {q.material}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {q.level}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Kunci: {q.answer}
                            </span>
                          </div>
                        </div>

                        {/* Text and KaTeX formula */}
                        <FormattedContent
                          content={q.text}
                          image={q.image}
                          className="text-xs sm:text-sm text-slate-900 font-medium"
                        />

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const key = String.fromCharCode(65 + oIdx);
                            const isAnswer = q.answer === key;
                            return (
                              <div
                                key={key}
                                className={`p-2 rounded-lg border flex items-start gap-2 ${
                                  isAnswer
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="w-4 text-center">{key}.</span>
                                <div className="flex-1">
                                  <FormattedContent content={opt} className="text-xs" />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Discussion */}
                        {q.discussion && (
                          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
                            <strong>Pembahasan: </strong>
                            <FormattedContent content={q.discussion} className="inline" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Form Input Single Soal Baru */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Materi / Topik Pembahasan
                  </label>
                  <input
                    type="text"
                    value={singleMaterial}
                    onChange={(e) => setSingleMaterial(e.target.value)}
                    placeholder="Persamaan Dasar Akuntansi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-hidden focus:border-[#12355b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tingkat Kognitif
                  </label>
                  <select
                    value={singleLevel}
                    onChange={(e) => setSingleLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-hidden focus:border-[#12355b]"
                  >
                    <option value="LOTS">LOTS (Mengingat / Memahami)</option>
                    <option value="MOTS">MOTS (Menerapkan / Menganalisis Dasar)</option>
                    <option value="HOTS">HOTS (Analisis Tinggi &amp; Evaluasi)</option>
                  </select>
                </div>
              </div>

              {/* Teks Soal & Rumus */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Teks Soal (Bisa Rumus LaTeX $...$)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSingleText((prev) => prev + ' $$Aktiva = Pasiva$$ ')}
                      className="text-[11px] text-blue-700 hover:underline font-mono"
                    >
                      + Rumus $$Aktiva = Pasiva$$
                    </button>
                  </div>
                </div>
                <textarea
                  value={singleText}
                  onChange={(e) => setSingleText(e.target.value)}
                  rows={4}
                  placeholder="Ketik teks soal di sini. Untuk rumus gunakan $rumus$ atau $$rumus$$"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-sans text-slate-800 outline-hidden focus:border-[#12355b]"
                />
              </div>

              {/* URL / Paste Gambar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gambar / Ilustrasi Soal (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={singleImage}
                    onChange={(e) => setSingleImage(e.target.value)}
                    placeholder="URL gambar (https://...) atau paste Data URL base64"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:border-[#12355b]"
                  />
                  {singleImage && (
                    <button
                      type="button"
                      onClick={() => setSingleImage('')}
                      className="px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {singleImage && (
                  <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block">
                    <img
                      src={singleImage}
                      alt="Preview"
                      className="max-h-36 rounded object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Options A-E */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Jawaban (A sampai E):
                </label>
                {singleOptions.map((opt, idx) => {
                  const key = String.fromCharCode(65 + idx);
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-xs text-slate-600 text-center">{key}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...singleOptions];
                          updated[idx] = e.target.value;
                          setSingleOptions(updated);
                        }}
                        placeholder={`Teks opsi ${key}`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-hidden focus:border-[#12355b]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Kunci & Pembahasan */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kunci Jawaban
                  </label>
                  <select
                    value={singleAnswer}
                    onChange={(e) => setSingleAnswer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 outline-hidden focus:border-[#12355b]"
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                    <option value="E">Opsi E</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pembahasan Soal
                  </label>
                  <input
                    type="text"
                    value={singleDiscussion}
                    onChange={(e) => setSingleDiscussion(e.target.value)}
                    placeholder="Tuliskan analisis atau pembahasan kunci jawaban..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-hidden focus:border-[#12355b]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {importMode === 'append' ? (
              <span>Soal yang diimport akan ditambahkan setelah nomor {currentQuestionsCount}.</span>
            ) : (
              <span className="text-rose-700 font-bold">Perhatian: Seluruh soal lama akan digantikan dengan naskah baru ini.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={activeMode === 'copypaste' && parsedPreview.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {activeMode === 'copypaste'
                  ? `Simpan ${parsedPreview.length ? `${parsedPreview.length} Soal` : ''} ke Bank Soal`
                  : 'Simpan Soal Baru'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
