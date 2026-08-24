import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Input, Textarea } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Plus, Edit2, Trash2, Key, Users } from "lucide-react";
import toast from "react-hot-toast";

export function TeachersManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    page,
    limit,
    total,
    totalPages,
    setPage,
    handleLimitChange,
    updatePagination,
  } = usePagination(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    nip: "",
    full_name: "",
    gender: "L",
    phone: "",
    email: "",
    address: "",
    username: "",
    password: "",
    is_active: 1,
  });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.TEACHERS.LIST, {
        page,
        limit,
        search,
        status: statusFilter,
      });
      if (res.success) {
        setTeachers(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Gagal memuat data guru.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, updatePagination]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleOpenCreate = () => {
    setSelectedTeacher(null);
    setFormData({
      nip: `GUR-${Date.now().toString().slice(-6)}`,
      full_name: "",
      gender: "L",
      phone: "",
      email: "",
      address: "",
      username: "",
      password: "password123",
      is_active: 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      nip: teacher.nip || "",
      full_name: teacher.full_name || "",
      gender: teacher.gender || "L",
      phone: teacher.phone || "",
      email: teacher.email || "",
      address: teacher.address || "",
      username: teacher.username || "",
      password: "",
      is_active: teacher.is_active ? 1 : 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selectedTeacher) {
        const res = await request.put(
          API_ENDPOINTS.TEACHERS.UPDATE(selectedTeacher.id),
          formData
        );
        if (res.success) {
          toast.success("Data guru berhasil diperbarui!");
          setIsFormOpen(false);
          fetchTeachers();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.TEACHERS.CREATE, formData);
        if (res.success) {
          toast.success("Guru baru berhasil didaftarkan!");
          setIsFormOpen(false);
          fetchTeachers();
        }
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan data guru.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    setDeleteLoading(true);
    try {
      const res = await request.delete(
        API_ENDPOINTS.TEACHERS.DELETE(selectedTeacher.id)
      );
      if (res.success) {
        toast.success("Data guru berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus data guru.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "NIP & Nama Guru",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
            {row.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{row.full_name}</p>
            <p className="text-xs text-slate-400">NIP: {row.nip || "-"} • @{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Kontak",
      accessor: "phone",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{row.phone || "-"}</p>
          <p className="text-slate-400">{row.email || "-"}</p>
        </div>
      ),
    },
    {
      header: "Kelompok & Santri",
      accessor: "total_groups",
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-700">{row.total_groups || 0} Kelompok</p>
          <p className="text-slate-500 font-medium">{row.total_students || 0} Santri Binaan</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <Badge variant={row.is_active ? "emerald" : "rose"} size="sm">
          {row.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
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
            title="Edit Guru"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Guru"
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
          <h2 className="text-xl font-bold text-slate-800">Manajemen Guru / Ustadz</h2>
          <p className="text-xs text-slate-500">Kelola akun guru pembimbing tahfidz, kontak, dan penugasan kelompok</p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Tambah Guru Baru
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari nama ustadz/guru, NIP, no HP..."
        />
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Status"
            options={[
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Nonaktif" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        <Table
          columns={columns}
          data={teachers}
          loading={loading}
          emptyTitle="Belum Ada Guru"
          emptyDescription="Silakan daftarkan ustadz/guru baru untuk membina kelompok tahfidz."
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTeacher ? "Edit Data Guru" : "Tambah Guru Pembimbing Baru"}
        subtitle="Buat profil guru dan akun login untuk mengakses sistem input setoran."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Induk Pegawai (NIP)"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
            <Input
              label="Nama Lengkap & Gelar"
              placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd.I"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: "L", label: "Laki-laki (Ustadz)" },
                { value: "P", label: "Perempuan (Ustadzah)" },
              ]}
              required
            />
            <Select
              label="Status Guru"
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
              options={[
                { value: 1, label: "Aktif Mengajar" },
                { value: 0, label: "Nonaktif / Cuti" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor HP / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Alamat Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Textarea
            label="Alamat Domisili"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Akun Login Guru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Username"
                value={formData.username}
                disabled={!!selectedTeacher}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required={!selectedTeacher}
              />
              <Input
                label={selectedTeacher ? "Reset Password (Opsional)" : "Password"}
                type="password"
                placeholder={selectedTeacher ? "Biarkan kosong jika tidak diubah" : "Minimal 6 karakter"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!selectedTeacher}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" loading={formLoading}>
              {selectedTeacher ? "Simpan Perubahan" : "Daftarkan Guru"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus akun ${selectedTeacher?.full_name}?`}
        loading={deleteLoading}
      />
    </div>
  );
}
