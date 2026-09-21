import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { FormattedContent } from './FormattedContent';
import { ImportQuestionsModal } from './ImportQuestionsModal';
import { 
  CheckCircle2, ChevronDown, ChevronUp, Filter, HelpCircle, Search, 
  ToggleLeft, ToggleRight, Sparkles, CheckCheck, FileUp, RotateCcw, 
  Trash2, Image as ImageIcon, Sigma, AlertCircle
} from 'lucide-react';

interface QuestionBankViewProps {
  questions: Question[];
  onToggleActive: (id: number) => void;
  onActivateAll?: () => void;
  onDeactivateAll?: () => void;
  onImportQuestions?: (imported: Question[], mode: 'append' | 'replace') => void;
  onResetQuestions?: () => void;
  onDeleteQuestion?: (id: number) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onToggleActive,
  onActivateAll,
  onDeactivateAll,
  onImportQuestions,
  onResetQuestions,
  onDeleteQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'LOTS' | 'MOTS' | 'HOTS'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const activeQuestionsCount = useMemo(() => questions.filter((q) => q.active).length, [questions]);
  const draftQuestionsCount = useMemo(() => questions.length - activeQuestionsCount, [questions, activeQuestionsCount]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(questions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleImportSubmit = (imported: Question[], mode: 'append' | 'replace') => {
    if (onImportQuestions) {
      onImportQuestions(imported, mode);
      setImportNotification(
        mode === 'append'
          ? `Berhasil menambahkan ${imported.length} butir soal baru ke Bank Soal!`
          : `Bank Soal berhasil diperbarui dengan ${imported.length} butir naskah baru!`
      );
      setTimeout(() => setImportNotification(null), 5000);
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm('Kembalikan Bank Soal ke 30 butir soal standar bawaan naskah Akuntansi & Persamaan Dasar Akuntansi?')) {
      if (onResetQuestions) {
        onResetQuestions();
        setImportNotification('Bank Soal telah dikembalikan ke 30 butir naskah standar.');
        setTimeout(() => setImportNotification(null), 5000);
      }
    }
  };

  const handleDeleteConfirm = (qId: number) => {
    if (window.confirm(`Hapus butir soal nomor ${qId} dari Bank Soal?`)) {
      if (onDeleteQuestion) {
        onDeleteQuestion(qId);
      }
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Status filter
      if (filterStatus === 'active' && !q.active) return false;
      if (filterStatus === 'draft' && q.active) return false;

      // Level filter
      if (filterLevel !== 'all' && q.level !== filterLevel) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inText = q.text.toLowerCase().includes(query);
        const inMaterial = q.material.toLowerCase().includes(query);
        const inDiscussion = q.discussion.toLowerCase().includes(query);
        const inId = String(q.id).includes(query);
        if (!inText && !inMaterial && !inDiscussion && !inId) return false;
      }

      return true;
    });
  }, [questions, filterStatus, filterLevel, searchQuery]);

  return (
    <section className="mt-6">
      {/* Toast Notifikasi Import */}
      {importNotification && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportNotification(null)}
            className="text-emerald-100 hover:text-white text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Action Banner: Import Soal & Ringkasan Bank Soal */}
      <div 
        id="bank-soal-header-banner"
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0b2745] via-[#12355b] to-[#165d62] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6 shadow-md"
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Manajemen Bank Soal CBT
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Bank Soal Ujian Online ({questions.length} Butir Soal)
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Dapat langsung digunakan untuk ujian siswa. Anda dapat menambah butir soal baru dengan sangat mudah melalui fitur <strong>Copy-Paste Dokumen</strong> yang mendukung formula matematika/akuntansi ($..$) dan gambar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Tombol Import Copy-Paste */}
          <button
            type="button"
            id="btn-open-import-soal"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0b2745] font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <span>Import Soal (Copy-Paste)</span>
          </button>

          {/* Tombol Reset */}
          {onResetQuestions && (
            <button
              type="button"
              onClick={handleResetConfirm}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Kembalikan ke 30 butir soal bawaan naskah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Standar</span>
            </button>
          )}

          {activeQuestionsCount < questions.length && onActivateAll && (
            <button
              type="button"
              onClick={onActivateAll}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Aktifkan Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teks soal, rumus, materi, nomor, atau kata kunci..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#12355b] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
            />
          </div>

          {/* Action toggle view */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Buka Semua Pembahasan
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Status Soal:</span>
            <div className="flex items-center gap-1">
              {(['all', 'active', 'draft'] as const).map((s) => {
                const label = s === 'all' ? `Semua (${questions.length})` : s === 'active' ? `Aktif (${activeQuestionsCount})` : `Draft (${draftQuestionsCount})`;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterStatus === s
                        ? 'bg-[#12355b] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Tingkat Berpikir:</span>
            <div className="flex items-center gap-1">
              {(['all', 'LOTS', 'MOTS', 'HOTS'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterLevel === lvl
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'all' ? 'Semua Level' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div id="question-admin-list" className="mt-5 space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <p>Tidak ada butir soal yang sesuai dengan kriteria pencarian Anda.</p>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#12355b] text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              <span>Import Soal Sekarang</span>
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedIds.has(q.id);

            return (
              <article
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300 space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                      {q.id}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm sm:text-base">
                        {q.material}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          q.level === 'HOTS' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          q.level === 'MOTS' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {q.level}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          q.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {q.active ? 'Soal Aktif Ujian' : 'Draft (Nonaktif)'}
                        </span>
                        {q.image && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Ada Gambar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle Active & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleActive(q.id)}
                      title="Klik untuk mengubah status aktif/nonaktif"
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {q.active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>

                    {onDeleteQuestion && (
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus soal ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text with KaTeX Formula & Image Renderer */}
                <div className="text-sm font-medium text-slate-800 mt-2 leading-relaxed">
                  <FormattedContent content={q.text} image={q.image} />
                </div>

                {/* Options preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 text-xs text-slate-700">
                  {q.options.map((opt, optIdx) => {
                    const key = String.fromCharCode(65 + optIdx);
                    const isCorrect = key === q.answer;

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <span className={`w-4 text-center shrink-0 ${isCorrect ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {key}.
                        </span>
                        <div className="flex-1">
                          <FormattedContent content={opt} />
                        </div>
                        {isCorrect && (
                          <span className="ml-auto text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold shrink-0">
                            KUNCI
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detail & Discussion Toggle */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpand(q.id)}
                    className="text-xs font-bold text-[#12355b] hover:text-[#0b2745] flex items-center gap-1.5 py-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Sembunyikan Pembahasan & Kunci' : 'Lihat Kunci & Pembahasan Lengkap'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-xs font-bold text-slate-500">
                    Kunci Resmi: <span className="text-emerald-700 font-black">{q.answer || 'N/A'}</span>
                  </span>
                </div>

                {/* Expanded Discussion View */}
                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 leading-relaxed animate-in fade-in-50 duration-150">
                    <strong className="block text-[#12355b] font-bold mb-1">
                      Analisis &amp; Pembahasan Soal:
                    </strong>
                    <FormattedContent content={q.discussion} />
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Modal Import Soal Copy-Paste */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentQuestionsCount={questions.length}
        onImport={handleImportSubmit}
      />
    </section>
  );
};
