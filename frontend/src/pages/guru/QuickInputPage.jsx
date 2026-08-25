import React, { useState, useEffect, useMemo } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { formatIndoDate, getTodayDateString, QUICK_NOTE_PRESETS } from "../../utils/helpers";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { LoadingSpinner, EmptyState } from "../../components/common/EmptyState";
import {
  Zap,
  Calendar,
  Save,
  CheckCircle2,
  BookOpen,
  History,
  Repeat,
  CheckSquare,
  Sparkles,
  Users,
  ChevronDown,
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
  const [savingStudentId, setSavingStudentId] = useState(null);

  // Per-student form state
  const [formData, setFormData] = useState({});

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
        if (resSurahs.success) {
          setSurahs(resSurahs.data);
        }
      } catch (err) {
        toast.error("Gagal memuat data awal kelompok.");
      } finally {
        setLoadingGroups(false);
      }
    }
    initData();
  }, []);

  // Format surah options for React-Select with rich searchable metadata (Surah Name, Number, Arabic, Juz, Ayahs)
  const surahOptions = useMemo(() => {
    return surahs.map((s) => ({
      value: String(s.id),
      label: `${s.number}. ${s.name_latin} (${s.name_arabic}) • Juz ${s.starting_juz} [${s.total_ayahs} Ayat]`,
      total_ayahs: s.total_ayahs,
      name_latin: s.name_latin,
      starting_juz: s.starting_juz,
      id: s.id,
      number: s.number,
    }));
  }, [surahs]);

  useEffect(() => {
    if (!selectedGroupId) return;

    async function loadGroupStudents() {
      setLoadingStudents(true);
      try {
        const res = await request.get(`${API_ENDPOINTS.GROUPS.STUDENTS(selectedGroupId)}?date=${date}`);
        if (res.success) {
          setStudents(res.data);

          // Initialize form state for each student
          const initial = {};
          res.data.forEach((s) => {
            const hasHafalanToday = !!s.today_hafalan_score;
            const hasMurojaahHarianToday = !!s.today_murojaah_harian_score;
            const hasMurojaahMingguanToday = !!s.today_murojaah_mingguan_score;

            // Default surahs if not set
            const defaultHafalanSurahId = s.today_hafalan_surah_id ? String(s.today_hafalan_surah_id) : "67"; // Al-Mulk
            const defaultMurojaahHarianSurahId = s.today_murojaah_harian_surah_id ? String(s.today_murojaah_harian_surah_id) : "78"; // An-Naba
            const defaultMurojaahMingguanSurahId = s.today_murojaah_mingguan_surah_id ? String(s.today_murojaah_mingguan_surah_id) : "78"; // An-Naba

            initial[s.id] = {
              attendance: s.today_attendance || "hadir",
              attendance_notes: s.today_attendance_notes || "",
              
              // 1. Hafalan Baru (Ziyadah)
              hasHafalan: hasHafalanToday || true,
              hafalan: {
                surah_id: defaultHafalanSurahId,
                surah_name: s.today_hafalan_surah || "Al-Mulk",
                start_ayah: s.today_start_ayah || 1,
                end_ayah: s.today_end_ayah || 10,
                score: s.today_hafalan_score || "A",
                notes: "",
              },

              // 2. Murojaah Harian (Sabaq)
              hasMurojaahHarian: hasMurojaahHarianToday || true,
              murojaah_harian: {
                type: "DAILY_MUROJAAH",
                surah_id: defaultMurojaahHarianSurahId,
                surah_name: s.today_murojaah_harian_surah || "An-Naba'",
                start_ayah: s.today_murojaah_harian_start_ayah || 1,
                end_ayah: s.today_murojaah_harian_end_ayah || 40,
                score: s.today_murojaah_harian_score || "A",
                notes: "",
              },

              // 3. Murojaah Mingguan (Manzil / Pekanan)
              hasMurojaahMingguan: hasMurojaahMingguanToday || false,
              murojaah_mingguan: {
                type: "WEEKLY_MUROJAAH",
                surah_id: defaultMurojaahMingguanSurahId,
                surah_name: s.today_murojaah_mingguan_surah || "An-Naba'",
                start_ayah: s.today_murojaah_mingguan_start_ayah || 1,
                end_ayah: s.today_murojaah_mingguan_end_ayah || 40,
                score: s.today_murojaah_mingguan_score || "A",
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
  }, [selectedGroupId, date]);

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

  const handleSurahSelectChange = (studentId, section, surahId) => {
    const s = surahs.find((item) => String(item.id) === String(surahId));
    if (s) {
      setFormData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [section]: {
            ...prev[studentId][section],
            surah_id: String(s.id),
            surah_name: s.name_latin,
            start_ayah: 1,
            end_ayah: section.includes("murojaah") ? s.total_ayahs : Math.min(10, s.total_ayahs),
          },
        },
      }));
    }
  };

  // Bulk toggles across all students
  const handleBulkToggle = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (next[s.id]) {
          next[s.id] = {
            ...next[s.id],
            [field]: value,
          };
        }
      });
      return next;
    });
    toast.success(`Berhasil memperbarui pilihan untuk seluruh santri`);
  };

  const handleSetAllAttendance = (status) => {
    setFormData((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (next[s.id]) {
          next[s.id] = {
            ...next[s.id],
            attendance: status,
          };
        }
      });
      return next;
    });
    toast.success(`Seluruh santri diatur ke status '${status}'`);
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
        murojaah_harian: state.hasMurojaahHarian ? state.murojaah_harian : null,
        murojaah_mingguan: state.hasMurojaahMingguan ? state.murojaah_mingguan : null,
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
    setSavingStudentId(student.id);
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
            murojaah_harian: state.hasMurojaahHarian ? state.murojaah_harian : null,
            murojaah_mingguan: state.hasMurojaahMingguan ? state.murojaah_mingguan : null,
          },
        ],
      };
      const res = await request.post(API_ENDPOINTS.REPORTS.QUICK_BATCH, payload);
      if (res.success) {
        toast.success(`Laporan untuk ${student.full_name} berhasil disimpan!`);
      }
    } catch (err) {
      toast.error("Gagal menyimpan laporan santri.");
    } finally {
      setSavingStudentId(null);
    }
  };

  // Live count of active items to save
  const totalStats = useMemo(() => {
    let countHafalan = 0;
    let countMurojaahHarian = 0;
    let countMurojaahMingguan = 0;

    students.forEach((s) => {
      const st = formData[s.id];
      if (st?.hasHafalan) countHafalan++;
      if (st?.hasMurojaahHarian) countMurojaahHarian++;
      if (st?.hasMurojaahMingguan) countMurojaahMingguan++;
    });

    return {
      countHafalan,
      countMurojaahHarian,
      countMurojaahMingguan,
      totalRecords: countHafalan + countMurojaahHarian + countMurojaahMingguan,
    };
  }, [students, formData]);

  if (loadingGroups) {
    return <LoadingSpinner text="Menyiapkan formulir quick input..." />;
  }

  return (
    <div className="space-y-6 pb-32 lg:pb-24">
      {/* Header & Mode Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Quick Input Setoran & Murojaah
              </h2>
              <p className="text-xs text-slate-500">
                Input Hafalan Baru, Murojaah Harian, & Murojaah Mingguan untuk seluruh santri halaqah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Ziyadah
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
              <History className="w-3.5 h-3.5 text-sky-600" />
              Murojaah Harian
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <Repeat className="w-3.5 h-3.5 text-purple-600" />
              Murojaah Mingguan
            </span>
          </div>
        </div>

        {/* Filters / Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <Select
            label="Pilih Kelompok / Halaqah"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            options={groups.map((g) => ({
              value: String(g.id),
              label: `${g.name} (${g.total_students || 0} Santri)`,
            }))}
            isClearable={false}
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

        {/* Bulk Control Action Bar */}
        {students.length > 0 && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              Aksi Cepat Massal:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAllAttendance("hadir")}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-all"
              >
                ✓ Semua Hadir
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggle("hasHafalan", true)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-all"
              >
                + Aktifkan Hafalan
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggle("hasMurojaahHarian", true)}
                className="px-2.5 py-1 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-all"
              >
                + Aktifkan Murojaah Harian
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggle("hasMurojaahMingguan", true)}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-all"
              >
                + Aktifkan Murojaah Mingguan
              </button>
            </div>
          </div>
        )}
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
        <div className="space-y-5">
          {students.map((student, index) => {
            const sData = formData[student.id] || {};
            const hafalan = sData.hafalan || {};
            const murojaahHarian = sData.murojaah_harian || {};
            const murojaahMingguan = sData.murojaah_mingguan || {};
            const isSavingThis = savingStudentId === student.id;

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200 hover:border-emerald-300"
              >
                {/* Student Header & Attendance */}
                <div className="bg-slate-50/90 px-4 sm:px-6 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{student.full_name}</h3>
                      <p className="text-[11px] text-slate-400">
                        NIS: <span className="font-semibold text-slate-600">{student.nis}</span> • Target: <span className="font-semibold text-emerald-700">{student.target_juz || "Juz 30"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Attendance Selector & Individual Save */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
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
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {attStatus}
                        </button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      loading={isSavingThis}
                      onClick={() => handleSingleSave(student)}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs font-bold"
                      title="Simpan khusus santri ini"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Simpan
                    </Button>
                  </div>
                </div>

                {/* 3 Form Sections: Hafalan Baru, Murojaah Harian, Murojaah Mingguan */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                  
                  {/* ========================================================= */}
                  {/* SEKSI 1: HAFALAN BARU (ZIYADAH) */}
                  {/* ========================================================= */}
                  <div
                    className={`rounded-2xl border transition-all p-4 space-y-3.5 ${
                      sData.hasHafalan
                        ? "bg-emerald-50/30 border-emerald-200/90 shadow-xs"
                        : "bg-slate-50/50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sData.hasHafalan}
                          onChange={(e) =>
                            handleStudentFieldChange(student.id, "root", "hasHafalan", e.target.checked)
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          Hafalan Baru (Ziyadah)
                        </span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Setoran Baru
                      </span>
                    </div>

                    {sData.hasHafalan && (
                      <div className="space-y-3 pt-0.5">
                        {/* Searchable React-Select for Surah */}
                        <Select
                          label="Pilih Surah / Juz"
                          options={surahOptions}
                          value={hafalan.surah_id || ""}
                          onChange={(e) => handleSurahSelectChange(student.id, "hafalan", e.target.value)}
                          placeholder="Cari Surah atau Juz..."
                          isClearable={false}
                          isSearchable={true}
                          isSmall={true}
                        />

                        {/* Ayat Range */}
                        <div className="grid grid-cols-2 gap-2">
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
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {/* Nilai Hafalan Baru A / B / C */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nilai Hafalan
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["A", "B", "C"].map((grade) => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() =>
                                  handleStudentFieldChange(student.id, "hafalan", "score", grade)
                                }
                                className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all ${
                                  hafalan.score === grade
                                    ? grade === "A"
                                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-xs"
                                      : grade === "B"
                                      ? "bg-amber-500 text-white ring-2 ring-amber-400 shadow-xs"
                                      : "bg-rose-600 text-white ring-2 ring-rose-400 shadow-xs"
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
                              className="text-[10px] text-emerald-700 bg-transparent border-0 cursor-pointer font-medium hover:underline focus:outline-none max-w-[150px] truncate"
                            >
                              <option value="">+ Preset Catatan</option>
                              {QUICK_NOTE_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Catatan tajwid, makhraj..."
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

                  {/* ========================================================= */}
                  {/* SEKSI 2: MUROJAAH HARIAN (SABAQ) */}
                  {/* ========================================================= */}
                  <div
                    className={`rounded-2xl border transition-all p-4 space-y-3.5 ${
                      sData.hasMurojaahHarian
                        ? "bg-sky-50/30 border-sky-200/90 shadow-xs"
                        : "bg-slate-50/50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sData.hasMurojaahHarian}
                          onChange={(e) =>
                            handleStudentFieldChange(student.id, "root", "hasMurojaahHarian", e.target.checked)
                          }
                          className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                          <History className="w-4 h-4 text-sky-600" />
                          Murojaah Harian (Sabaq)
                        </span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                        Harian
                      </span>
                    </div>

                    {sData.hasMurojaahHarian && (
                      <div className="space-y-3 pt-0.5">
                        {/* Searchable React-Select for Surah */}
                        <Select
                          label="Pilih Surah / Juz"
                          options={surahOptions}
                          value={murojaahHarian.surah_id || ""}
                          onChange={(e) => handleSurahSelectChange(student.id, "murojaah_harian", e.target.value)}
                          placeholder="Cari Surah atau Juz..."
                          isClearable={false}
                          isSearchable={true}
                          isSmall={true}
                        />

                        {/* Ayat Range */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Mulai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaahHarian.start_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah_harian",
                                  "start_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Selesai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaahHarian.end_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah_harian",
                                  "end_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                          </div>
                        </div>

                        {/* Nilai Murojaah Harian A / B / C */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nilai Murojaah Harian
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["A", "B", "C"].map((grade) => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() =>
                                  handleStudentFieldChange(student.id, "murojaah_harian", "score", grade)
                                }
                                className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all ${
                                  murojaahHarian.score === grade
                                    ? grade === "A"
                                      ? "bg-sky-600 text-white ring-2 ring-sky-400 shadow-xs"
                                      : grade === "B"
                                      ? "bg-amber-500 text-white ring-2 ring-amber-400 shadow-xs"
                                      : "bg-rose-600 text-white ring-2 ring-rose-400 shadow-xs"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {grade} {grade === "A" ? "(Mutqin)" : grade === "B" ? "(Baik)" : "(Ulang)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Murojaah Harian */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Catatan
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStudentFieldChange(student.id, "murojaah_harian", "notes", e.target.value);
                                }
                              }}
                              className="text-[10px] text-sky-700 bg-transparent border-0 cursor-pointer font-medium hover:underline focus:outline-none max-w-[150px] truncate"
                            >
                              <option value="">+ Preset Catatan</option>
                              {QUICK_NOTE_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Catatan kelancaran sabaq..."
                            value={murojaahHarian.notes || ""}
                            onChange={(e) =>
                              handleStudentFieldChange(student.id, "murojaah_harian", "notes", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* SEKSI 3: MUROJAAH MINGGUAN (MANZIL / PEKANAN) */}
                  {/* ========================================================= */}
                  <div
                    className={`rounded-2xl border transition-all p-4 space-y-3.5 ${
                      sData.hasMurojaahMingguan
                        ? "bg-purple-50/30 border-purple-200/90 shadow-xs"
                        : "bg-slate-50/50 border-slate-200/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sData.hasMurojaahMingguan}
                          onChange={(e) =>
                            handleStudentFieldChange(student.id, "root", "hasMurojaahMingguan", e.target.checked)
                          }
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Repeat className="w-4 h-4 text-purple-600" />
                          Murojaah Mingguan (Manzil)
                        </span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                        Mingguan
                      </span>
                    </div>

                    {sData.hasMurojaahMingguan && (
                      <div className="space-y-3 pt-0.5">
                        {/* Searchable React-Select for Surah */}
                        <Select
                          label="Pilih Surah / Juz"
                          options={surahOptions}
                          value={murojaahMingguan.surah_id || ""}
                          onChange={(e) => handleSurahSelectChange(student.id, "murojaah_mingguan", e.target.value)}
                          placeholder="Cari Surah atau Juz..."
                          isClearable={false}
                          isSearchable={true}
                          isSmall={true}
                        />

                        {/* Ayat Range */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Mulai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaahMingguan.start_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah_mingguan",
                                  "start_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ayat Selesai
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={murojaahMingguan.end_ayah || 1}
                              onChange={(e) =>
                                handleStudentFieldChange(
                                  student.id,
                                  "murojaah_mingguan",
                                  "end_ayah",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Nilai Murojaah Mingguan A / B / C */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nilai Murojaah Mingguan
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["A", "B", "C"].map((grade) => (
                              <button
                                key={grade}
                                type="button"
                                onClick={() =>
                                  handleStudentFieldChange(student.id, "murojaah_mingguan", "score", grade)
                                }
                                className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all ${
                                  murojaahMingguan.score === grade
                                    ? grade === "A"
                                      ? "bg-purple-600 text-white ring-2 ring-purple-400 shadow-xs"
                                      : grade === "B"
                                      ? "bg-amber-500 text-white ring-2 ring-amber-400 shadow-xs"
                                      : "bg-rose-600 text-white ring-2 ring-rose-400 shadow-xs"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {grade} {grade === "A" ? "(Mutqin)" : grade === "B" ? "(Baik)" : "(Ulang)"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Catatan Murojaah Mingguan */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Catatan
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStudentFieldChange(student.id, "murojaah_mingguan", "notes", e.target.value);
                                }
                              }}
                              className="text-[10px] text-purple-700 bg-transparent border-0 cursor-pointer font-medium hover:underline focus:outline-none max-w-[150px] truncate"
                            >
                              <option value="">+ Preset Catatan</option>
                              {QUICK_NOTE_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Catatan evaluasi manzil..."
                            value={murojaahMingguan.notes || ""}
                            onChange={(e) =>
                              handleStudentFieldChange(student.id, "murojaah_mingguan", "notes", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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

      {/* Floating Bottom Sticky Bar to Save All - Responsive offset for desktop sidebar */}
      {students.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 lg:left-64 z-30 px-4 sm:px-6 max-w-4xl mx-auto pointer-events-none transition-all duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pointer-events-auto">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Siap Menyimpan Laporan Halaqah
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {students.length} Santri • {totalStats.totalRecords} Catatan ({totalStats.countHafalan} Hafalan, {totalStats.countMurojaahHarian} M. Harian, {totalStats.countMurojaahMingguan} M. Mingguan) • {formatIndoDate(date, { weekday: "short" })}
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              loading={savingBatch}
              icon={CheckCircle2}
              onClick={handleBatchSave}
              className="w-full sm:w-auto px-7 py-3 shadow-lg shadow-emerald-600/40 text-xs sm:text-sm font-extrabold"
            >
              SIMPAN SEMUA LAPORAN ({students.length} SANTRI)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
