import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { CheckCircle2, ChevronDown, ChevronUp, Filter, HelpCircle, Search, ToggleLeft, ToggleRight, Sparkles, CheckCheck } from 'lucide-react';

interface QuestionBankViewProps {
  questions: Question[];
  onToggleActive: (id: number) => void;
  onActivateAll?: () => void;
  onDeactivateAll?: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onToggleActive,
  onActivateAll,
  onDeactivateAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | 'LOTS' | 'MOTS' | 'HOTS'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

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
      {/* Informational Source Banner */}
      <div 
        id="source-note"
        className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 leading-relaxed mb-6 shadow-2xs"
      >
        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="block text-emerald-900 font-bold">Seluruh 30 Butir Soal Naskah Aktif:</strong>
            {activeQuestionsCount < questions.length && onActivateAll && (
              <button
                type="button"
                onClick={onActivateAll}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Aktifkan Semua ({questions.length})</span>
              </button>
            )}
          </div>
          <p className="mt-1 text-emerald-800 text-xs leading-relaxed">
            Semua butir soal (Nomor 1–30) dari materi Akuntansi sebagai Sistem Informasi dan Persamaan Dasar Akuntansi berstatus <strong>aktif</strong> untuk ujian CBT siswa dengan penilaian otomatis dan kunci jawaban lengkap.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nomor, materi, atau kata kunci..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-hidden"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
            {onActivateAll && activeQuestionsCount < questions.length && (
              <button
                type="button"
                onClick={onActivateAll}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Aktifkan Semua</span>
              </button>
            )}
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Buka Semua Pembahasan
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Status Soal:</span>
            <div className="flex items-center gap-1">
              {(['all', 'active', 'draft'] as const).map((s) => {
                const count = s === 'all' ? questions.length : s === 'active' ? activeQuestionsCount : draftQuestionsCount;
                const label = s === 'all' ? `Semua (${count})` : s === 'active' ? `Aktif (${count})` : `Nonaktif (${count})`;
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
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            Tidak ada butir soal yang sesuai dengan kriteria filter Anda.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedIds.has(q.id);

            return (
              <article
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300"
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          q.level === 'HOTS' ? 'bg-purple-50 text-purple-700' :
                          q.level === 'MOTS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {q.level}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          q.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {q.active ? 'Soal Aktif Ujian' : 'Draft (Perlu Dilengkapi)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Active Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleActive(q.id)}
                      title="Klik untuk mengubah status aktif/draft"
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      {q.active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Status: Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Status: Nonaktif</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-medium text-slate-800 mt-3.5 leading-relaxed">
                  {q.text}
                </p>

                {/* Options preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 text-xs text-slate-700">
                  {q.options.map((opt, optIdx) => {
                    const key = String.fromCharCode(65 + optIdx);
                    const isCorrect = key === q.answer;

                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <span className={isCorrect ? 'text-emerald-700' : 'text-slate-400'}>{key}.</span>
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="ml-auto text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
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
                      Analisis & Pembahasan Dokumen:
                    </strong>
                    {q.discussion}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
