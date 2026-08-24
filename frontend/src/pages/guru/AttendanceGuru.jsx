import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { getTodayDateString, formatIndoDate } from "../../utils/helpers";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { LoadingSpinner, EmptyState } from "../../components/common/EmptyState";
import { CheckSquare, Save } from "lucide-react";
import toast from "react-hot-toast";

export function AttendanceGuru() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await request.get(API_ENDPOINTS.GROUPS.LIST);
        if (res.success && res.data.length > 0) {
          setGroups(res.data);
          setSelectedGroupId(String(res.data[0].id));
        }
      } catch (err) {
        toast.error("Gagal memuat kelompok.");
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    async function loadStudents() {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.GROUPS.STUDENTS(selectedGroupId));
        if (res.success) {
          setStudents(res.data);
          const initial = {};
          res.data.forEach((s) => {
            initial[s.id] = {
              status: s.today_attendance || "hadir",
              notes: "",
            };
          });
          setAttendanceMap(initial);
        }
      } catch (err) {
        toast.error("Gagal memuat santri kelompok.");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedGroupId, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    const records = students.map((s) => ({
      student_id: s.id,
      status: attendanceMap[s.id]?.status || "hadir",
      notes: attendanceMap[s.id]?.notes || "",
    }));

    try {
      const res = await request.post(API_ENDPOINTS.ATTENDANCE.BULK, {
        group_id: Number(selectedGroupId),
        date,
        records,
      });
      if (res.success) {
        toast.success("Absensi santri berhasil disimpan!");
      }
    } catch (err) {
      toast.error("Gagal menyimpan absensi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Absensi Kehadiran Santri</h2>
        <p className="text-xs text-slate-500">Catat kehadiran harian halaqah (Hadir, Izin, Sakit, Alpa)</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Kelompok Halaqah"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          options={groups.map((g) => ({ value: String(g.id), label: g.name }))}
        />
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat daftar absensi..." />
      ) : students.length === 0 ? (
        <EmptyState title="Tidak Ada Santri" description="Kelompok ini belum memiliki santri." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="divide-y divide-slate-100">
            {students.map((student, idx) => {
              const currentStatus = attendanceMap[student.id]?.status || "hadir";
              return (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{student.full_name}</h4>
                      <p className="text-xs text-slate-400">NIS: {student.nis}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {["hadir", "izin", "sakit", "alpa"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(student.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          currentStatus === st
                            ? st === "hadir"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : st === "izin"
                              ? "bg-amber-500 text-white shadow-xs"
                              : st === "sakit"
                              ? "bg-blue-500 text-white shadow-xs"
                              : "bg-rose-600 text-white shadow-xs"
                            : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button icon={Save} loading={saving} onClick={handleSaveAttendance}>
              Simpan Absensi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
