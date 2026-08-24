import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate } from "../../utils/helpers";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { LoadingSpinner } from "../../components/common/EmptyState";
import { BookOpen, CheckCircle, Target, TrendingUp, History, User } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardSantri() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSantriData() {
      try {
        const res = await request.get(API_ENDPOINTS.DASHBOARD.STATS);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Fetch santri dashboard failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSantriData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard santri..." />;
  }

  const student = data?.student || {};
  const summary = data?.summary || {};
  const todayStatus = data?.todayStatus || {};
  const target = data?.activeTarget || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-card">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-2">
            Hafalan Santri
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu'alaikum, {student.full_name || "Santri"}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            NIS: {student.nis} • {student.group_name || "Kelompok Tahfidz"} • Pembimbing: {student.teacher_name ? `Ust. ${student.teacher_name}` : "-"}
          </p>
        </div>
      </div>

      {/* Progress Cards: Juz 30 & Juz 29 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Progres Juz 30 (Juz 'Amma)
            </h3>
            <span className="text-xs font-extrabold text-emerald-700">{summary.juz30Progress || 0}%</span>
          </div>
          <ProgressBar value={summary.juz30Progress || 0} color="emerald" size="lg" />
          <p className="text-xs text-slate-500 mt-3">
            Target dasar surah An-Naba' sampai An-Nas (37 Surah).
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Progres Juz 29 (Tabarak)
            </h3>
            <span className="text-xs font-extrabold text-teal-700">{summary.juz29Progress || 0}%</span>
          </div>
          <ProgressBar value={summary.juz29Progress || 0} color="blue" size="lg" />
          <p className="text-xs text-slate-500 mt-3">
            Target lanjutan surah Al-Mulk sampai Al-Mursalat (11 Surah).
          </p>
        </div>
      </div>

      {/* Today Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Setoran Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Hafalan Baru Hari Ini
          </h4>
          {todayStatus.setoran ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-emerald-800">
                  Surah {todayStatus.setoran.surah_name}
                </p>
                <p className="text-xs text-slate-500">
                  Ayat {todayStatus.setoran.start_ayah} - {todayStatus.setoran.end_ayah}
                </p>
              </div>
              <ScoreBadge score={todayStatus.setoran.score} size="lg" />
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">Belum melakukan setoran baru hari ini.</p>
          )}
        </div>

        {/* Murojaah Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Murojaah Hari Ini
          </h4>
          {todayStatus.murojaah ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-blue-800">
                  Surah {todayStatus.murojaah.surah_name}
                </p>
                <p className="text-xs text-slate-500">
                  Ayat {todayStatus.murojaah.start_ayah} - {todayStatus.murojaah.end_ayah}
                </p>
              </div>
              <ScoreBadge score={todayStatus.murojaah.score} size="lg" />
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">Belum melakukan murojaah hari ini.</p>
          )}
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Riwayat Hafalan Terakhir</h3>
            <p className="text-xs text-slate-500">Catatan setoran dan nilai dari guru pembimbing</p>
          </div>
          <Link to="/santri/history" className="text-xs font-bold text-emerald-700 hover:underline">
            Lihat Semua
          </Link>
        </div>

        {data?.recentHistory && data.recentHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentHistory.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      {formatIndoDate(h.date, { weekday: "short" })}
                    </span>
                    <ReportTypeBadge type={h.type} />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Surah {h.surah_name} (Ayat {h.start_ayah} - {h.end_ayah})
                  </p>
                  {h.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">"{h.notes}"</p>}
                </div>
                <ScoreBadge score={h.score} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat setoran.</p>
        )}
      </div>
    </div>
  );
}
