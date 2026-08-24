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
import { Plus, Edit2, Trash2, Eye, UserCheck, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function StudentsManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
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
    target_juz: "Juz 30",
    group_id: "",
    status: "active",
    username: "",
    password: "",
  });

  const fetchGroups = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.GROUPS.LIST);
      if (res.success) setGroups(res.data);
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
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenCreate = () => {
    setSelectedStudent(null);
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
      target_juz: "Juz 30",
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
      target_juz: student.target_juz || "Juz 30",
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
      header: "NIS & Santri",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
            {row.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm hover:text-emerald-700 cursor-pointer" onClick={() => navigate(`/students/${row.id}`)}>
              {row.full_name}
            </p>
            <p className="text-xs text-slate-400">NIS: {row.nis}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Kelompok & Pembimbing",
      accessor: "group_name",
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-700">{row.group_name || "Belum ditentukan"}</p>
          <p className="text-[11px] text-slate-500">{row.teacher_name ? `Ust. ${row.teacher_name}` : "-"}</p>
        </div>
      ),
    },
    {
      header: "Target Hafalan",
      accessor: "target_juz",
      render: (row) => (
        <Badge variant="emerald" size="sm">
          {row.target_juz || "Juz 30"}
        </Badge>
      ),
    },
    {
      header: "Orang Tua / Wali",
      accessor: "parent_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{row.parent_name || "-"}</p>
          <p className="text-slate-400">{row.parent_phone || "-"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "emerald" : "amber"} size="sm">
          {row.status === "active" ? "Aktif" : "Nonaktif"}
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
            onClick={() => navigate(`/students/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Lihat Profil Lengkap"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Data"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Data"
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
          <h2 className="text-xl font-bold text-slate-800">Manajemen Data Santri</h2>
          <p className="text-xs text-slate-500">Kelola seluruh data santri, target hafalan, dan kelompok pembimbing</p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Tambah Santri Baru
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
          placeholder="Cari nama santri, NIS, atau wali..."
        />
        <div className="w-full sm:w-64">
          <Select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Kelompok"
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        <Table
          columns={columns}
          data={students}
          loading={loading}
          emptyTitle="Belum Ada Santri"
          emptyDescription="Silakan tambahkan data santri atau sesuaikan kata kunci pencarian Anda."
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
        title={selectedStudent ? "Edit Data Santri" : "Tambah Santri Baru"}
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
              required
            />
            <Input
              label="Tempat Lahir"
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
            <Select
              label="Kelompok Tahfidz"
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              placeholder="-- Pilih Kelompok --"
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
            />
            <Select
              label="Target Hafalan"
              value={formData.target_juz}
              onChange={(e) => setFormData({ ...formData, target_juz: e.target.value })}
              options={[
                { value: "Juz 30", label: "Juz 30 (An-Naba s.d An-Nas)" },
                { value: "Juz 30 & 29", label: "Juz 30 & 29 (Al-Mulk s.d An-Nas)" },
                { value: "Juz 28 - 30", label: "Juz 28, 29, 30 (3 Juz)" },
                { value: "5 Juz", label: "Target 5 Juz" },
                { value: "10 Juz", label: "Target 10 Juz" },
                { value: "30 Juz", label: "Khatam 30 Juz (Tahfidz Mutqin)" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Orang Tua / Wali"
              value={formData.parent_name}
              onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
            />
            <Input
              label="No. HP Orang Tua / WhatsApp"
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Alamat Lengkap"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />

          {!selectedStudent && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
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
            <Button type="submit" loading={formLoading}>
              {selectedStudent ? "Simpan Perubahan" : "Tambah Santri"}
            </Button>
          </div>
        </form>
      </Modal>

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
