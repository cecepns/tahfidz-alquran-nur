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
import { Select, AsyncSelect } from "../../components/common/Select";
import { TargetOptionsModal } from "../../components/common/TargetOptionsModal";
import { Badge } from "../../components/common/Badge";
import { Plus, Edit2, Trash2, Eye, UserCheck, GraduationCap, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function StudentsManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

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
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nis: "",
    nik: "",
    full_name: "",
    gender: "L",
    birth_place: "",
    birth_date: "",
    address: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    target_juz: "Juz 30 (An-Naba s.d An-Nas)",
    group_id: "",
    status: "active",
    username: "",
    password: "",
  });

  const fetchGroups = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.GROUPS.LIST);
      if (res.success) setGroups(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTargetOptions = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.TARGET_OPTIONS.LIST);
      if (res.success && res.data) {
        setTargetOptions(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.STUDENTS.LIST, {
        page,
        limit,
        search,
        group_id: selectedGroup || undefined,
      });
      if (res.success) {
        setStudents(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Gagal memuat data santri.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedGroup, updatePagination]);

  useEffect(() => {
    fetchGroups();
    fetchTargetOptions();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Async search for Groups
  const loadGroupOptions = async (inputValue) => {
    try {
      const res = await request.get(API_ENDPOINTS.GROUPS.LIST);
      if (res.success) {
        const list = res.data || [];
        const filtered = list.filter((g) =>
          g.name.toLowerCase().includes((inputValue || "").toLowerCase())
        );
        return filtered.map((g) => ({
          value: g.id,
          label: `${g.name} (${g.teacher_name || "Belum ada ustadz"})`,
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const handleOpenCreate = () => {
    setSelectedStudent(null);
    const defaultTarget = targetOptions[0]?.name || "Juz 30 (An-Naba s.d An-Nas)";
    setFormData({
      nis: `SNT-${Date.now().toString().slice(-6)}`,
      nik: "",
      full_name: "",
      gender: "L",
      birth_place: "",
      birth_date: "",
      address: "",
      phone: "",
      parent_name: "",
      parent_phone: "",
      target_juz: defaultTarget,
      group_id: "",
      status: "active",
      username: "",
      password: "password123",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      nis: student.nis || "",
      nik: student.nik || "",
      full_name: student.full_name || "",
      gender: student.gender || "L",
      birth_place: student.birth_place || "",
      birth_date: student.birth_date || "",
      address: student.address || "",
      phone: student.phone || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      target_juz: student.target_juz || targetOptions[0]?.name || "Juz 30",
      group_id: student.group_id || "",
      status: student.status || "active",
      username: student.username || "",
      password: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selectedStudent) {
        // Update
        const res = await request.put(
          API_ENDPOINTS.STUDENTS.UPDATE(selectedStudent.id),
          formData
        );
        if (res.success) {
          toast.success("Data santri berhasil diperbarui!");
          setIsFormOpen(false);
          fetchStudents();
        }
      } else {
        // Create
        const res = await request.post(API_ENDPOINTS.STUDENTS.CREATE, formData);
        if (res.success) {
          toast.success("Santri baru berhasil ditambahkan!");
          setIsFormOpen(false);
          fetchStudents();
        }
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan data santri.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setDeleteLoading(true);
    try {
      const res = await request.delete(
        API_ENDPOINTS.STUDENTS.DELETE(selectedStudent.id)
      );
      if (res.success) {
        toast.success("Data santri berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus santri.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "Santri",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-sm overflow-hidden flex-shrink-0">
            {row.photo ? (
              <img
                src={row.photo}
                alt={row.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              row.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-bold text-slate-800 hover:text-emerald-700 transition-colors">
              {row.full_name}
            </div>
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
              <span>NIS: {row.nis}</span>
              <span>•</span>
              <span>{row.gender === "L" ? "Ikhwan" : "Akhwat"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Kelompok / Halaqah",
      accessor: "group_name",
      render: (row) => (
        <div>
          {row.group_name ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
              {row.group_name}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Belum ada kelompok</span>
          )}
          {row.teacher_name && (
            <p className="text-[11px] text-slate-500 mt-1">
              Ust. {row.teacher_name}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Target Hafalan",
      accessor: "target_juz",
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          {row.target_juz || "Juz 30"}
        </span>
      ),
    },
    {
      header: "Wali Santri & Kontak",
      accessor: "parent_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{row.parent_name || "-"}</p>
          <p className="text-slate-500 font-mono mt-0.5">{row.parent_phone || row.phone || "-"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge
          variant={
            row.status === "active"
              ? "success"
              : row.status === "graduated"
              ? "info"
              : "danger"
          }
        >
          {row.status === "active"
            ? "Aktif"
            : row.status === "graduated"
            ? "Lulus"
            : "Nonaktif"}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => navigate(`/admin/students/${row.id}`)}
            title="Lihat Detail Profil & Raport"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Edit2}
            onClick={() => handleOpenEdit(row)}
            title="Edit Data Santri"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => handleOpenDelete(row)}
            title="Hapus Santri"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Manajemen Data Santri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola seluruh data santri, kelompok tahfidz, target hafalan, dan informasi wali.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={Settings2}
            onClick={() => setIsTargetModalOpen(true)}
          >
            Kelola Target
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreate}
            className="shadow-lg shadow-emerald-600/20"
          >
            Tambah Santri Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar with React-Select */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
        <div className="sm:col-span-2">
          <SearchInput
            placeholder="Cari berdasarkan nama, NIS, wali, atau no. HP..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>

        <div>
          <Select
            placeholder="-- Semua Kelompok --"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Semua Kelompok" },
              ...groups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="Tidak ada data santri ditemukan."
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
        title={selectedStudent ? "Edit Profil Santri" : "Tambah Santri Baru"}
        subtitle="Lengkapi data profil santri dan tentukan kelompok pembimbing."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Induk Santri (NIS)"
              value={formData.nis}
              onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              required
            />
            <Input
              label="Nama Lengkap Santri"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: "L", label: "Laki-laki (Ikhwan)" },
                { value: "P", label: "Perempuan (Akhwat)" },
              ]}
              isClearable={false}
              required
            />
            <Input
              label="Tempat Lahir"
              placeholder="Contoh: Bandung"
              value={formData.birth_place}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AsyncSelect
              label="Kelompok Tahfidz (Cari by API)"
              placeholder="Ketik untuk mencari kelompok..."
              loadOptions={loadGroupOptions}
              value={
                formData.group_id
                  ? {
                      value: formData.group_id,
                      label:
                        groups.find((g) => String(g.id) === String(formData.group_id))?.name ||
                        "Kelompok Terpilih",
                    }
                  : null
              }
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
            />

            <Select
              label="Target Hafalan"
              value={formData.target_juz}
              onChange={(e) => setFormData({ ...formData, target_juz: e.target.value })}
              options={targetOptions.map((t) => ({ value: t.name, label: t.name }))}
              actionButton={
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(true)}
                  className="text-xs text-emerald-600 font-bold hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Kelola Target
                </button>
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Orang Tua / Wali"
              placeholder="Nama bapak/ibu wali santri..."
              value={formData.parent_name}
              onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
            />
            <Input
              label="No. HP Orang Tua / WhatsApp"
              placeholder="Contoh: 08123456789"
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Alamat Lengkap"
            placeholder="Alamat domisili santri saat ini..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />

          {!selectedStudent && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Akun Login Santri (Opsional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Username"
                  placeholder="Contoh: ahmad.fauzan"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Default: password123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {selectedStudent ? "Simpan Perubahan" : "Tambah Santri"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dynamic Target Options Modal */}
      <TargetOptionsModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onOptionsUpdated={(newOpts) => {
          setTargetOptions(newOpts);
          if (newOpts.length > 0 && !formData.target_juz) {
            setFormData((prev) => ({ ...prev, target_juz: newOpts[0].name }));
          }
        }}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Santri"
        message={`Apakah Anda yakin ingin menghapus santri ${selectedStudent?.full_name}? Seluruh riwayat setoran dan absensinya juga akan terhapus.`}
        loading={deleteLoading}
      />
    </div>
  );
}
