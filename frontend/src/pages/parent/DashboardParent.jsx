import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate } from "../../utils/helpers";
import { ScoreBadge, ReportTypeBadge, AttendanceBadge } from "../../components/common/Badge";
import { LoadingSpinner, EmptyState } from "../../components/common/EmptyState";
import { Users, BookOpen, CheckCircle, Clock, Heart, Award } from "lucide-react";

export function DashboardParent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParentData() {
      try {
        const res = await request.get(API_ENDPOINTS.DASHBOARD.STATS);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchParentData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard wali santri..." />;
  }

  const children = data?.children || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-card">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-2">
            Portal Wali Santri
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu'alaikum, {data?.parent?.full_name || "Bapak/Ibu"}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Pantau perkembangan setoran hafalan, keaktifan murojaah, dan evaluasi guru pembimbing ananda.
          </p>
        </div>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="Data Anak Belum Terhubung"
          description="Akun Anda belum terhubung dengan santri. Silakan hubungi admin yayasan."
        />
      ) : (
        children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden space-y-6 p-6"
          >
            {/* Child Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  {child.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{child.full_name}</h3>
                  <p className="text-xs text-slate-500">
                    NIS: {child.nis} • {child.group_name || "Kelompok Tahfidz"} • Target: {child.target_juz || "Juz 30"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Kehadiran Hari Ini:</p>
                  <AttendanceBadge status={child.todayAttendance} />
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700">Total Setoran Baru</p>
                <h4 className="text-xl font-extrabold text-emerald-950 mt-1">{child.totalSetoran || 0} Kali</h4>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700">Total Murojaah</p>
                <h4 className="text-xl font-extrabold text-blue-950 mt-1">{child.totalMurojaah || 0} Kali</h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
                <p className="text-xs font-semibold text-slate-600">Guru Pembimbing</p>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{child.teacher_name ? `Ust. ${child.teacher_name}` : "-"}</h4>
                <p className="text-[11px] text-slate-400">{child.teacher_phone || ""}</p>
              </div>
            </div>

            {/* Recent Reports Table */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Catatan & Evaluasi Guru Terakhir
              </h4>

              {child.recentReports && child.recentReports.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {child.recentReports.map((r) => (
                    <div key={r.id} className="p-3.5 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">{formatIndoDate(r.date, { weekday: "short" })}</span>
                          <ReportTypeBadge type={r.type} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          Surah {r.surah_name} (Ayat {r.start_ayah} - {r.end_ayah})
                        </p>
                        {r.notes && <p className="text-xs text-slate-600 italic mt-0.5">"{r.notes}"</p>}
                      </div>
                      <div>
                        <ScoreBadge score={r.score} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">Belum ada riwayat laporan.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
