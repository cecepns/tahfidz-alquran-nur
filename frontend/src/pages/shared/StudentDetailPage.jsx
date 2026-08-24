import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate } from "../../utils/helpers";
import { ScoreBadge, ReportTypeBadge, AttendanceBadge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { LoadingSpinner } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import {
  ArrowLeft,
  Printer,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'targets' | 'attendance'

  useEffect(() => {
    async function loadStudentDetail() {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.STUDENTS.DETAIL(id));
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error(err.message || "Gagal memuat profil santri.");
      } finally {
        setLoading(false);
      }
    }
    loadStudentDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Memuat profil lengkap santri..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Data santri tidak ditemukan.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
          Kembali
        </Button>
      </div>
    );
  }

  const { student, reports = [], targets = [], attendance = [], analytics = {} } = data;

  return (
    <div className="space-y-6 print:p-0 print:m-0">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Kembali
        </Button>
        <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
          Cetak Raport / Kartu Hafalan
        </Button>
      </div>

      {/* Printable Raport Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  {student.full_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {student.status === "active" ? "Santri Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                NIS: <span className="font-semibold text-slate-700">{student.nis}</span> • Kelompok: <span className="font-semibold text-slate-700">{student.group_name || "-"}</span>
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                Guru Pembimbing: Ust. {student.teacher_name || "-"}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-500">
            <p>
              Target: <span className="font-bold text-slate-800">{student.target_juz || "Juz 30"}</span>
            </p>
            <p>
              Orang Tua: <span className="font-semibold text-slate-700">{student.parent_name || "-"}</span> ({student.parent_phone || "-"})
            </p>
            <p>
              Tanggal Masuk: {formatIndoDate(student.join_date, { weekday: undefined })}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <ProgressBar
              label="Progres Hafalan Juz 30"
              value={analytics.juz30Percent || 0}
              color="emerald"
              size="lg"
            />
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <ProgressBar
              label="Progres Hafalan Juz 29"
              value={analytics.juz29Percent || 0}
              color="blue"
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs (Hidden in Print) */}
      <div className="flex border-b border-slate-200 print:hidden gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Riwayat Setoran ({reports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("targets")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "targets"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Target Hafalan ({targets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "attendance"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Absensi Kehadiran ({attendance.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Catatan Setoran & Evaluasi Bimbingan</h3>
          </div>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data riwayat setoran.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{formatIndoDate(r.date, { weekday: "short" })}</span>
                      <ReportTypeBadge type={r.type} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      Surah {r.surah_name} (Ayat {r.start_ayah} - {r.end_ayah})
                    </p>
                    {r.notes && <p className="text-xs text-slate-600 italic mt-0.5">"{r.notes}"</p>}
                  </div>
                  <div>
                    <ScoreBadge score={r.score} size="md" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "targets" && (
        <div className="space-y-3">
          {targets.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-2xl border border-slate-200">
              Belum ada target hafalan yang ditetapkan.
            </p>
          ) : (
            targets.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">{t.target_title}</h4>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${t.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                    {t.status === "completed" ? "Selesai" : "Sedang Berjalan"}
                  </span>
                </div>
                <ProgressBar value={t.progress_percent} color="emerald" size="sm" />
                <p className="text-xs text-slate-500">
                  Periode: {formatIndoDate(t.start_date)} s.d {formatIndoDate(t.end_date)}
                </p>
                {t.notes && <p className="text-xs text-slate-600 italic">"{t.notes}"</p>}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Riwayat Kehadiran Santri</h3>
          </div>
          {attendance.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data absensi.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.map((att) => (
                <div key={att.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{formatIndoDate(att.date)}</p>
                    {att.notes && <p className="text-xs text-slate-400">{att.notes}</p>}
                  </div>
                  <AttendanceBadge status={att.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
