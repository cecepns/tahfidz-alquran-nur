import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { ProgressBar } from "../../components/common/ProgressBar";
import { LoadingSpinner } from "../../components/common/EmptyState";
import { BookOpen, CheckCircle, Award } from "lucide-react";

export function MyHafalanProgress() {
  const [surahs, setSurahs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resSurahs, resReports] = await Promise.all([
          request.get(API_ENDPOINTS.QURAN.SURAHS),
          request.get(API_ENDPOINTS.REPORTS.LIST, { limit: 200 }),
        ]);
        if (resSurahs.success) setSurahs(resSurahs.data);
        if (resReports.success) setReports(resReports.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat progres Al-Qur'an..." />;
  }

  // Calculate completed surahs
  const completedSurahIds = new Set(
    reports.filter((r) => r.type === "NEW_MEMORIZATION").map((r) => r.surah_id)
  );

  const juz30Surahs = surahs.filter((s) => s.starting_juz === 30);
  const juz29Surahs = surahs.filter((s) => s.starting_juz === 29);

  const juz30Done = juz30Surahs.filter((s) => completedSurahIds.has(s.id)).length;
  const juz29Done = juz29Surahs.filter((s) => completedSurahIds.has(s.id)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Peta Kemajuan Hafalan Al-Qur'an</h2>
        <p className="text-xs text-slate-500">Daftar surah yang telah dihafal dan disetorkan ke Ustadz pembimbing</p>
      </div>

      {/* Juz 30 Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              30
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Juz 30 (Juz 'Amma)</h3>
              <p className="text-xs text-slate-500">
                {juz30Done} dari {juz30Surahs.length} Surah Selesai Dihafal
              </p>
            </div>
          </div>
          <span className="text-sm font-extrabold text-emerald-700">
            {Math.round((juz30Done / (juz30Surahs.length || 1)) * 100)}%
          </span>
        </div>

        <ProgressBar
          value={juz30Done}
          max={juz30Surahs.length || 1}
          color="emerald"
          showValue={false}
          size="md"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
          {juz30Surahs.map((s) => {
            const isDone = completedSurahIds.has(s.id);
            return (
              <div
                key={s.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isDone
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-400"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  No. {s.number}
                </span>
                <p className="text-xs font-bold truncate">{s.name_latin}</p>
                <p className="text-base font-arabic mt-0.5">{s.name_arabic}</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {isDone ? (
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Mutqin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">{s.total_ayahs} Ayat</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Juz 29 Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              29
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Juz 29 (Tabarak)</h3>
              <p className="text-xs text-slate-500">
                {juz29Done} dari {juz29Surahs.length} Surah Selesai Dihafal
              </p>
            </div>
          </div>
          <span className="text-sm font-extrabold text-blue-700">
            {Math.round((juz29Done / (juz29Surahs.length || 1)) * 100)}%
          </span>
        </div>

        <ProgressBar
          value={juz29Done}
          max={juz29Surahs.length || 1}
          color="blue"
          showValue={false}
          size="md"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
          {juz29Surahs.map((s) => {
            const isDone = completedSurahIds.has(s.id);
            return (
              <div
                key={s.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isDone
                    ? "bg-blue-50 border-blue-200 text-blue-950 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-400"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  No. {s.number}
                </span>
                <p className="text-xs font-bold truncate">{s.name_latin}</p>
                <p className="text-base font-arabic mt-0.5">{s.name_arabic}</p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {isDone ? (
                    <span className="text-[10px] font-semibold text-blue-700 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Mutqin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">{s.total_ayahs} Ayat</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
