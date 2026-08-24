import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate, getAutoMurojaahType, SCORE_MAP } from "../../utils/helpers";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  Calendar,
  History,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function DashboardGuru() {
  const navigate = useNavigate();
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
        console.error("Guru stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard ustadz..." />;
  }

  const today = formatIndoDate(new Date().toISOString());
  const autoMurojaah = getAutoMurojaahType();

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-2">
              {today}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Assalamu'alaikum, {data?.teacher?.full_name || "Ustadz"}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md">
              {autoMurojaah.isFriday ? (
                <span className="font-bold text-amber-300">
                  ✨ Hari Jumat: Waktunya Murojaah Pekanan!
                </span>
              ) : (
                "Bimbing santri menghafal Al-Qur'an dengan sabar dan istiqomah."
              )}
            </p>
          </div>

          <Button
            size="lg"
            variant="amber"
            icon={Zap}
            onClick={() => navigate("/guru/quick-input")}
            className="shadow-xl ring-4 ring-amber-400/30"
          >
            + Quick Input Setoran
          </Button>
        </div>
      </div>

      {/* Metrics for Teacher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Santri Binaan</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{data?.totalSantriBinaan || 0}</h3>
            <span className="text-[11px] text-blue-600 font-bold">{data?.groups?.length || 0} Kelompok Halaqah</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sudah Setor Hari Ini</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">{data?.sudahSetorCount || 0}</h3>
            <span className="text-[11px] text-slate-400">Santri telah selesai setor</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Belum Setor</p>
            <h3 className="text-2xl font-extrabold text-rose-600">{data?.belumSetorCount || 0}</h3>
            <span className="text-[11px] text-rose-500 font-medium">Santri menunggu giliran</span>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Mode Input Massal Santri</h4>
            <p className="text-xs text-emerald-700">
              Input hafalan dan nilai A/B/C seluruh santri dalam 1 kelompok sekaligus tanpa reload halaman!
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/guru/quick-input")} size="sm">
          Buka Halaman Setoran
        </Button>
      </div>

      {/* Recent Setoran Today */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Setoran Terakhir Santri Binaan</h3>
            <p className="text-xs text-slate-500">Laporan yang telah Anda input hari ini</p>
          </div>
          <Link to="/guru/history" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
            Lihat Riwayat Lengkap <ArrowRight className="w-3.5 h-3.5" />
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
                  {r.notes && <p className="text-[11px] text-slate-400 mt-0.5 italic">"{r.notes}"</p>}
                </div>
                <div className="text-right">
                  <ScoreBadge score={r.score} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">Belum ada setoran yang dicatat hari ini.</p>
            <Button
              variant="soft"
              size="sm"
              icon={Zap}
              onClick={() => navigate("/guru/quick-input")}
              className="mt-3"
            >
              Mulai Input Setoran
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
