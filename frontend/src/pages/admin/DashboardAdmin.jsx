import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate, SCORE_MAP } from "../../utils/helpers";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/EmptyState";
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FolderGit2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await request.get(API_ENDPOINTS.DASHBOARD.STATS);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Fetch dashboard stats failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat data dashboard yayasan..." />;
  }

  const summary = data?.summary || {};
  const weekly = data?.weeklyActivity || [];
  const scoreDist = data?.scoreDistribution || { A: 0, B: 0, C: 0 };
  const totalScores = (scoreDist.A + scoreDist.B + scoreDist.C) || 1;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-card">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-2">
            Panel Administrator Yayasan
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Manajemen Tahfidz
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Pantau seluruh aktivitas setoran hafalan, santri aktif, guru pembimbing, dan perkembangan murojaah secara real-time.
          </p>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Santri</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{summary.totalSantri || 0}</h3>
            <span className="text-[11px] text-emerald-600 font-bold">{summary.santriAktif || 0} Santri Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Guru / Ustadz</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{summary.totalGuru || 0}</h3>
            <span className="text-[11px] text-blue-600 font-bold">{summary.guruAktif || 0} Guru Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Setoran Hari Ini</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{summary.setoranHariIni || 0}</h3>
            <span className="text-[11px] text-teal-600 font-medium">Hafalan Baru</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Belum Setor</p>
            <h3 className="text-2xl font-extrabold text-rose-600">{summary.countBelumSetor || 0}</h3>
            <span className="text-[11px] text-rose-500 font-medium">Perlu perhatian</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Activity Chart + Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Aktivitas Setoran 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Jumlah setoran hafalan & murojaah harian</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {weekly.map((item, idx) => {
              const maxCount = Math.max(...weekly.map((w) => w.count), 1);
              const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl transition-all duration-300 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">{item.dayName}</p>
                    <p className="text-[10px] text-slate-400">{item.date.split("-").slice(1).join("/")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Distribution (A / B / C) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Distribusi Nilai Hafalan</h3>
            <p className="text-xs text-slate-500 mb-5">Standar mutu setoran A, B, dan C</p>

            <div className="space-y-4">
              {/* Grade A */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Nilai A (Sangat Baik / Mutqin)
                  </span>
                  <span>{scoreDist.A} ({Math.round((scoreDist.A / totalScores) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(scoreDist.A / totalScores) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grade B */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Nilai B (Baik)
                  </span>
                  <span>{scoreDist.B} ({Math.round((scoreDist.B / totalScores) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(scoreDist.B / totalScores) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grade C */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Nilai C (Perlu Perbaikan)
                  </span>
                  <span>{scoreDist.C} ({Math.round((scoreDist.C / totalScores) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${(scoreDist.C / totalScores) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              Lihat Detail Semua Nilai <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Santri Belum Setor & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Santri Belum Setor Alert Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Santri Belum Setor Hari Ini
              </h3>
              <p className="text-xs text-slate-500">Daftar santri yang belum melakukan setoran hafalan</p>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Semua Santri
            </Link>
          </div>

          {data?.santriBelumSetor && data.santriBelumSetor.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.santriBelumSetor.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{s.full_name}</h4>
                    <p className="text-xs text-slate-500">
                      NIS: {s.nis} • {s.group_name || "Belum ada kelompok"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-500">
                      Pembimbing: <span className="text-slate-800 font-semibold">{s.teacher_name || "-"}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium py-6 text-center">
              🎉 MasyaAllah, seluruh santri telah melakukan setoran hari ini!
            </p>
          )}
        </div>

        {/* Recent Reports Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Setoran Terbaru</h3>
              <p className="text-xs text-slate-500">Laporan hafalan dan murojaah yang baru masuk</p>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-emerald-700 hover:underline">
              Lihat Semua
            </Link>
          </div>

          {data?.recentReports && data.recentReports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentReports.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{r.student_name}</h4>
                      <ReportTypeBadge type={r.type} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Surah {r.surah_name} (Ayat {r.start_ayah} - {r.end_ayah})
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <ScoreBadge score={r.score} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">Belum ada laporan setoran.</p>
          )}
        </div>
      </div>
    </div>
  );
}
