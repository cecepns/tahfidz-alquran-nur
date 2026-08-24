import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate, getTodayDateString, getAutoMurojaahType, QUICK_NOTE_PRESETS, SCORE_MAP } from "../../utils/helpers";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { LoadingSpinner, EmptyState } from "../../components/common/EmptyState";
import { Badge, ScoreBadge } from "../../components/common/Badge";
import {
  Zap,
  Calendar,
  Check,
  Save,
  CheckCircle2,
  BookOpen,
  History,
  Sparkles,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export function QuickInputPage() {
  const [groups, setGroups] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [students, setStudents] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);

  // Per-student form state
  const [formData, setFormData] = useState({});

  const autoMurojaah = getAutoMurojaahType(date);

  useEffect(() => {
    async function initData() {
      try {
        const [resGroups, resSurahs] = await Promise.all([
          request.get(API_ENDPOINTS.GROUPS.LIST),
          request.get(API_ENDPOINTS.QURAN.SURAHS),
        ]);
        if (resGroups.success) {
          setGroups(resGroups.data);
          if (resGroups.data.length > 0) {
            setSelectedGroupId(String(resGroups.data[0].id));
          }
        }
        if (resSurahs.success) setSurahs(resSurahs.data);
      } catch (err) {
        toast.error("Gagal memuat data awal kelompok.");
      } finally {
        setLoadingGroups(false);
      }
    }
    initData();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    async function loadGroupStudents() {
      setLoadingStudents(true);
      try {
        const res = await request.get(API_ENDPOINTS.GROUPS.STUDENTS(selectedGroupId));
        if (res.success) {
          setStudents(res.data);

          // Initialize form state for each student
          const initial = {};
          res.data.forEach((s) => {
            initial[s.id] = {
              attendance: s.today_attendance || "hadir",
              attendance_notes: "",
              // Hafalan Baru
              hasHafalan: s.today_hafalan_score ? true : true,
              hafalan: {
                surah_id: s.today_hafalan_surah ? "" : "67", // Default Al-Mulk or previous
                surah_name: s.today_hafalan_surah || "Al-Mulk",
                start_ayah: s.today_start_ayah || 1,
                end_ayah: s.today_end_ayah || 10,
                score: s.today_hafalan_score || "A",
                notes: "",
              },
              // Murojaah
              hasMurojaah: s.today_murojaah_score ? true : true,
              murojaah: {
                type: autoMurojaah.type,
                surah_id: "78", // Default An-Naba
                surah_name: "An-Naba'",
                start_ayah: 1,
                end_ayah: 40,
                score: s.today_murojaah_score || "A",
                notes: "",
              },
            };
          });
          setFormData(initial);
        }
      } catch (err) {
        toast.error("Gagal memuat daftar santri kelompok ini.");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadGroupStudents();
  }, [selectedGroupId, date, autoMurojaah.type]);

  const handleStudentFieldChange = (studentId, section, field, value) => {
    setFormData((prev) => {
      const studentState = prev[studentId] || {};
      if (section === "root") {
        return {
          ...prev,
          [studentId]: {
            ...studentState,
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [studentId]: {
          ...studentState,
          [section]: {
            ...studentState[section],
            [field]: value,
          },
        },
      };
    });
  };

  const handleSurahChange = (studentId, section, surahId) => {
    const s = surahs.find((item) => String(item.id) === String(surahId));
    if (s) {
      setFormData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [section]: {
            ...prev[studentId][section],
            surah_id: s.id,
            surah_name: s.name_latin,
            end_ayah: section === "murojaah" ? s.total_ayahs : Math.min(10, s.total_ayahs),
          },
        },
      }));
    }
  };

  const handleBatchSave = async () => {
    if (students.length === 0) return;

    setSavingBatch(true);
    const reportsPayload = students.map((s) => {
      const state = formData[s.id] || {};
      return {
        student_id: s.id,
        attendance: state.attendance,
        attendance_notes: state.attendance_notes,
        hafalan: state.hasHafalan ? state.hafalan : null,
        murojaah: state.hasMurojaah ? state.murojaah : null,
      };
    });

    try {
      const res = await request.post(API_ENDPOINTS.REPORTS.QUICK_BATCH, {
        group_id: Number(selectedGroupId),
        date,
        reports: reportsPayload,
      });

      if (res.success) {
        toast.success(res.message || "Seluruh laporan santri berhasil disimpan!");
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan batch setoran santri.");
    } finally {
      setSavingBatch(false);
    }
  };

  const handleSingleSave = async (student) => {
    const state = formData[student.id] || {};
    try {
      const payload = {
        group_id: Number(selectedGroupId),
        date,
        reports: [
          {
            student_id: student.id,
            attendance: state.attendance,
            attendance_notes: state.attendance_notes,
            hafalan: state.hasHafalan ? state.hafalan : null,
            murojaah: state.hasMurojaah ? state.murojaah : null,
          },
        ],
      };
      const res = await request.post(API_ENDPOINTS.REPORTS.QUICK_BATCH, payload);
      if (res.success) {
        toast.success(`Laporan untuk ${student.full_name} berhasil disimpan!`);
      }
    } catch (err) {
      toast.error("Gagal menyimpan laporan santri.");
    }
  };

  if (loadingGroups) {
    return <LoadingSpinner text="Menyiapkan formulir quick input..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Mode Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Quick Input Setoran Harian
              </h2>
              <p className="text-xs text-slate-500">
                Pilih halaqah dan input seluruh santri sekaligus dalam 1 halaman
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${autoMurojaah.badgeColor}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {autoMurojaah.label} ({autoMurojaah.description})
          </span>
        </div>

        {/* Filters / Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <Select
            label="Pilih Kelompok / Halaqah"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            options={groups.map((g) => ({
              value: String(g.id),
              label: `${g.name} (${g.total_students || 0} Santri)`,
            }))}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
              Tanggal Setoran
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Student List Cards for Quick Input */}
      {loadingStudents ? (
        <LoadingSpinner text="Memuat daftar santri kelompok..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="Tidak Ada Santri"
          description="Kelompok ini belum memiliki santri binaan. Hubungi admin untuk mendaftarkan santri."
        />
      ) : (
        <div className="space-y-4">
          {students.map((student, index) => {
            const sData = formData[student.id] || {};
            const hafalan = sData.hafalan || {};
            const murojaah = sData.murojaah || {};

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200 hover:border-emerald-300"
              >
                {/* Student Header */}
                <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{student.full_name}</h3>
                      <p className="text-[11px] text-slate-400">
                        NIS: {student.nis} • Target: {student.target_juz || "Juz 30"}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Selector */}
                  <div className="flex items-center gap-1.5">
                    {["hadir", "izin", "sakit", "alpa"].map((attStatus) => (
                      <button
                        key={attStatus}
                        type="button"
                        onClick={() =>
                          handleStudentFieldChange(student.id, "root", "attendance", attStatus)
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          sData.attendance === attStatus
                            ? attStatus === "hadir"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : attStatus === "izin"
                              ? "bg-amber-500 text-white shadow-xs"
                              : attStatus === "sakit"
                              ? "bg-blue-500 text-white shadow-xs"
                              : "bg-rose-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {attStatus}
                      </button>
                    ))}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSingleSave(student)}
                      className="ml-2 text-emerald-700 hover:bg-emerald-50 text-xs"
                      title="Simpan khusus santri ini"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Form Sections: Hafalan Baru & Murojaah */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SECTION 1: HAFALAN BARU */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sData.hasHafalan}
                          onChange={(e) =>
                            handleStudentFieldChange(student.id, "root", "hasHafalan", e.target.checked)
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          Hafalan Baru (Ziyadah)
                        </span>
                      </label>
                      <span className="text-[11px] text-emerald-600 font-semibold">Setoran Baru</span>
                    </div>

                    {sData.hasHafalan && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Surah
                            </label>
                            <select
                              value={hafalan.surah_id || ""}
                              onChange={(e) => handleSurahChange(student.id, "hafalan", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                            >
                              {surahs.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.number}. {s.name_latin}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Mulai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={hafalan.start_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "hafalan",
                                  "start_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Selesai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={hafalan.end_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "hafalan",
                                  "end_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {/* Nilai Hafalan Baru A / B / C */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nilai Hafalan
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["A", "B", "C"].map((grade) => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() =>
                                  handleStudentFieldChange(student.id, "hafalan", "score", grade)
                                }
                                className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                                  hafalan.score === grade
                                    ? grade === "A"
                                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-sm"
                                      : grade === "B"
                                      ? "bg-amber-500 text-white ring-2 ring-amber-400 shadow-sm"
                                      : "bg-rose-600 text-white ring-2 ring-rose-400 shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {grade} {grade === "A" ? "(Mutqin)" : grade === "B" ? "(Baik)" : "(Ulang)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Ustadz */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Catatan Guru
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStudentFieldChange(student.id, "hafalan", "notes", e.target.value);
                                }
                              }}
                              className="text-[10px] text-emerald-700 bg-transparent border-0 cursor-pointer font-medium hover:underline focus:outline-none"
                            >
                              <option value="">+ Pilih Preset Catatan</option>
                              {QUICK_NOTE_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Catatan bacaan, makhraj, tajwid..."
                            value={hafalan.notes || ""}
                            onChange={(e) =>
                              handleStudentFieldChange(student.id, "hafalan", "notes", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: MUROJAAH */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sData.hasMurojaah}
                          onChange={(e) =>
                            handleStudentFieldChange(student.id, "root", "hasMurojaah", e.target.checked)
                          }
                          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-blue-600" />
                          {autoMurojaah.label}
                        </span>
                      </label>
                      <span className="text-[11px] text-blue-600 font-semibold">Pengulangan</span>
                    </div>

                    {sData.hasMurojaah && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Surah / Juz
                            </label>
                            <select
                              value={murojaah.surah_id || ""}
                              onChange={(e) => handleSurahChange(student.id, "murojaah", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            >
                              {surahs.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.number}. {s.name_latin}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Mulai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaah.start_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah",
                                  "start_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Selesai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaah.end_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah",
                                  "end_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        {/* Nilai Murojaah A / B / C */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nilai Murojaah
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["A", "B", "C"].map((grade) => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() =>
                                  handleStudentFieldChange(student.id, "murojaah", "score", grade)
                                }
                                className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all ${
                                  murojaah.score === grade
                                    ? grade === "A"
                                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-sm"
                                      : grade === "B"
                                      ? "bg-amber-500 text-white ring-2 ring-amber-400 shadow-sm"
                                      : "bg-rose-600 text-white ring-2 ring-rose-400 shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {grade} {grade === "A" ? "(Mutqin)" : grade === "B" ? "(Baik)" : "(Ulang)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Murojaah */}
                        <div>
                          <input
                            type="text"
                            placeholder="Catatan kelancaran murojaah..."
                            value={murojaah.notes || ""}
                            onChange={(e) =>
                              handleStudentFieldChange(student.id, "murojaah", "notes", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Sticky Bar to Save All */}
      {students.length > 0 && (
        <div className="fixed bottom-14 lg:bottom-4 left-0 right-0 z-20 px-4 sm:px-8 max-w-4xl mx-auto pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-4 pointer-events-auto">
            <div className="hidden sm:block">
              <p className="text-xs font-bold">Siap Menyimpan Laporan</p>
              <p className="text-[11px] text-slate-400">
                {students.length} Santri • {formatIndoDate(date, { weekday: "short" })}
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              loading={savingBatch}
              icon={CheckCircle2}
              onClick={handleBatchSave}
              className="w-full sm:w-auto px-8 shadow-lg shadow-emerald-600/40 text-sm font-extrabold"
            >
              SIMPAN SEMUA LAPORAN ({students.length} SANTRI)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
