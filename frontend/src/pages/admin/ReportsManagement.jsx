import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Input, Textarea } from "../../components/common/Input";
import { formatIndoDate, getTodayDateString } from "../../utils/helpers";
import { Download, Filter, Trash2, Edit2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    page,
    limit,
    total,
    totalPages,
    setPage,
    handleLimitChange,
    updatePagination,
  } = usePagination(10);

  // Edit / Delete Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    type: "NEW_MEMORIZATION",
    surah_id: "",
    start_ayah: 1,
    end_ayah: 1,
    score: "A",
    notes: "",
  });

  const fetchSurahs = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.QURAN.SURAHS);
      if (res.success) setSurahs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.LIST, {
        page,
        limit,
        search,
        type: typeFilter || undefined,
        score: scoreFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success) {
        setReports(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error("Gagal memuat daftar laporan setoran.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, typeFilter, scoreFilter, startDate, endDate, updatePagination]);

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const token = localStorage.getItem("tahfidz_token");
    const baseUrl = import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/tahfidz-nur/api";
    window.open(`${baseUrl}${API_ENDPOINTS.REPORTS.EXPORT_CSV}?${params.toString()}&token=${token}`, "_blank");
    toast.success("Mengunduh data laporan format CSV/Excel...");
  };

  const handleOpenEdit = (report) => {
    setSelectedReport(report);
    setEditFormData({
      type: report.type,
      surah_id: report.surah_id || "",
      start_ayah: report.start_ayah,
      end_ayah: report.end_ayah,
      score: report.score,
      notes: report.notes || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (report) => {
    setSelectedReport(report);
    setIsDeleteOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await request.put(
        API_ENDPOINTS.REPORTS.UPDATE(selectedReport.id),
        editFormData
      );
      if (res.success) {
        toast.success("Laporan berhasil diperbarui.");
        setIsEditOpen(false);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui laporan.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const res = await request.delete(
        API_ENDPOINTS.REPORTS.DELETE(selectedReport.id)
      );
      if (res.success) {
        toast.success("Laporan setoran berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus laporan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "Tanggal",
      accessor: "date",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {formatIndoDate(row.date, { weekday: "short" })}
        </span>
      ),
    },
    {
      header: "Santri",
      accessor: "student_name",
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{row.student_name}</h4>
          <p className="text-xs text-slate-400">NIS: {row.nis} • {row.group_name || "-"}</p>
        </div>
      ),
    },
    {
      header: "Jenis",
      accessor: "type",
      render: (row) => <ReportTypeBadge type={row.type} />,
    },
    {
      header: "Surah & Ayat",
      accessor: "surah_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-800">
            Surah {row.surah_name || "-"}
          </p>
          <p className="text-slate-500">
            Ayat {row.start_ayah} - {row.end_ayah} ({row.total_ayahs} Ayat)
          </p>
        </div>
      ),
    },
    {
      header: "Nilai",
      accessor: "score",
      align: "center",
      render: (row) => <ScoreBadge score={row.score} size="sm" />,
    },
    {
      header: "Catatan Guru",
      accessor: "notes",
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={row.notes}>
          {row.notes || "-"}
        </p>
      ),
    },
    {
      header: "Aksi",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Laporan"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Laporan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekap Laporan Setoran & Murojaah</h2>
          <p className="text-xs text-slate-500">Lihat, saring, dan unduh data seluruh laporan hafalan santri</p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" icon={Download}>
          Export Excel / CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Cari santri, surah, catatan..."
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Jenis"
            options={[
              { value: "NEW_MEMORIZATION", label: "Hafalan Baru" },
              { value: "DAILY_MUROJAAH", label: "Murojaah Harian" },
              { value: "WEEKLY_MUROJAAH", label: "Murojaah Pekanan" },
            ]}
          />

          <Select
            value={scoreFilter}
            onChange={(e) => {
              setScoreFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Nilai"
            options={[
              { value: "A", label: "Nilai A (Sangat Baik)" },
              { value: "B", label: "Nilai B (Baik)" },
              { value: "C", label: "Nilai C (Perlu Perbaikan)" },
            ]}
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              title="Dari Tanggal"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        <Table
          columns={columns}
          data={reports}
          loading={loading}
          emptyTitle="Belum Ada Laporan"
          emptyDescription="Belum ada data setoran yang cocok dengan filter yang dipilih."
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Koreksi Laporan Setoran"
        subtitle={`Koreksi data hafalan santri: ${selectedReport?.student_name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Select
            label="Jenis Laporan"
            value={editFormData.type}
            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
            options={[
              { value: "NEW_MEMORIZATION", label: "Hafalan Baru" },
              { value: "DAILY_MUROJAAH", label: "Murojaah Harian (Senin-Kamis)" },
              { value: "WEEKLY_MUROJAAH", label: "Murojaah Pekanan (Jumat)" },
            ]}
            required
          />

          <Select
            label="Surah"
            value={editFormData.surah_id}
            onChange={(e) => setEditFormData({ ...editFormData, surah_id: e.target.value })}
            options={surahs.map((s) => ({ value: s.id, label: `${s.number}. ${s.name_latin} (${s.total_ayahs} ayat)` }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ayat Mulai"
              type="number"
              min="1"
              value={editFormData.start_ayah}
              onChange={(e) => setEditFormData({ ...editFormData, start_ayah: e.target.value })}
              required
            />
            <Input
              label="Ayat Selesai"
              type="number"
              min="1"
              value={editFormData.end_ayah}
              onChange={(e) => setEditFormData({ ...editFormData, end_ayah: e.target.value })}
              required
            />
          </div>

          <Select
            label="Nilai Mutu"
            value={editFormData.score}
            onChange={(e) => setEditFormData({ ...editFormData, score: e.target.value })}
            options={[
              { value: "A", label: "A — Sangat Baik (Mutqin)" },
              { value: "B", label: "B — Baik (Perlu sedikit bimbingan)" },
              { value: "C", label: "C — Perlu Perbaikan (Mengulang)" },
            ]}
            required
          />

          <Textarea
            label="Catatan Guru"
            value={editFormData.notes}
            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" loading={formLoading}>
              Simpan Koreksi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Laporan Setoran"
        message="Apakah Anda yakin ingin menghapus catatan setoran ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
