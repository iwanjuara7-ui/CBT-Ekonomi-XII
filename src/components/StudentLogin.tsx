import React, { useState } from 'react';
import { Participant } from '../types';
import { EXAM_CONFIG } from '../data/questions';
import { BookOpen, GraduationCap, ShieldCheck, User, Users, Sparkles } from 'lucide-react';

interface StudentLoginProps {
  onStudentSubmit: (participant: Participant) => void;
  onOpenAdmin: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onStudentSubmit,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedClass = studentClass.trim();

    if (!trimmedName || !trimmedClass) {
      setError('Nama lengkap dan kelas wajib diisi.');
      return;
    }

    setError('');
    onStudentSubmit({
      name: trimmedName,
      studentClass: trimmedClass,
    });
  };

  return (
    <div id="identity-screen" className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Left Visual Aside */}
      <aside className="lg:col-span-6 xl:col-span-7 p-8 md:p-14 lg:p-20 text-white relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b2745] via-[#12355b] to-[#165d62]">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center font-extrabold text-[#0b2745] text-lg shadow-lg shadow-amber-400/20">
              CBT
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 block">
                Sistem Asesmen Sekolah
              </span>
              <span className="text-xs text-blue-200 font-medium">Versi ANBK Standar</span>
            </div>
          </div>

          <div className="mt-14 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Ruang Asesmen Digital
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              CBT Ekonomi Kelas XII
            </h1>
            <p className="mt-4 text-base sm:text-lg text-blue-100 font-normal leading-relaxed">
              Ujian kompetensi materi Akuntansi sebagai Sistem Informasi dan Persamaan Dasar Akuntansi berstandar asesmen nasional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-emerald-300 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">2 Bab Pembahasan</h4>
                  <p className="text-xs text-blue-200 mt-0.5 leading-normal">
                    Sejarah, prinsip akuntansi, hingga persamaan dasar akuntansi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-amber-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Otomatis & Transparan</h4>
                  <p className="text-xs text-blue-200 mt-0.5 leading-normal">
                    Penilaian instan dengan kunci jawaban dan analisis pembahasan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-blue-200">
          <p>© 2026 Portal Ujian Terpadu — SMA / MA</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Ujian Aktif</span>
          </div>
        </div>
      </aside>

      {/* Right Login Panel */}
      <section className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-2xl shadow-xl border border-slate-100">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block">
              Pilih Akses Anda
            </span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">
              Masuk ke Ruang Ujian
            </h2>
          </div>

          {/* Access Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6 text-sm font-bold">
            <button
              id="student-tab"
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError('');
              }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-[#12355b] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Login Siswa</span>
            </button>

            <button
              id="admin-tab"
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError('');
              }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-[#12355b] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guru / Admin</span>
            </button>
          </div>

          {/* Student Form Pane */}
          {activeTab === 'student' && (
            <form id="identity-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-slate-500 leading-relaxed">
                Isi nama lengkap dan kelas Anda. Token ujian resmi akan diberikan secara acak pada halaman peraturan ujian.
              </p>

              <div>
                <label htmlFor="full-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Siswa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="full-name"
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Iwan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="student-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kelas / Rombel
                </label>
                <input
                  id="student-class"
                  type="text"
                  required
                  placeholder="Contoh: XII IPS 1 / XII MIPA 2"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Token ujian acak unik akan langsung terbit untuk Anda di layar berikutnya.</span>
              </div>

              {error && (
                <div id="identity-error" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium" role="alert">
                  {error}
                </div>
              )}

              <button
                id="continue-button"
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Halaman Peraturan</span>
              </button>
            </form>
          )}

          {/* Admin / Teacher Pane */}
          {activeTab === 'admin' && (
            <div id="admin-login" className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Buka dashboard guru untuk memantau rekap hasil ujian peserta didik serta meninjau seluruh bank soal (30 nomor lengkap dengan kunci & pembahasan).
              </p>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs leading-relaxed">
                <span className="font-bold block mb-1">Akses Pengawas & Guru:</span>
                Dashboard ini menyediakan ringkasan nilai, status penyelesaian, ekspor lembar rekap nilai, serta tinjauan analisis butir soal dari naskah dokumen asli.
              </div>

              <button
                id="admin-login-button"
                type="button"
                onClick={onOpenAdmin}
                className="w-full py-3 px-4 rounded-xl bg-[#12355b] hover:bg-[#0b2745] text-white font-bold text-sm shadow-md shadow-[#12355b]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Users className="w-4 h-4" />
                <span>Buka Dashboard Guru / Admin</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
