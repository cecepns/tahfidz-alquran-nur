import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Input, Textarea } from "../../components/common/Input";
import { Select, AsyncSelect } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Table } from "../../components/common/Table";
import { Plus, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

export function GroupsManagement() {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    description: "",
    schedule_days: "Senin - Jumat",
    schedule_time: "16:00 - 17:30",
    target_description: "Target Juz 30 & 29",
    is_active: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGroups, resTeachers] = await Promise.all([
        request.get(API_ENDPOINTS.GROUPS.LIST),
        request.get(API_ENDPOINTS.TEACHERS.LIST, { limit: 100 }),
      ]);
      if (resGroups.success) setGroups(resGroups.data || []);
      if (resTeachers.success) setTeachers(resTeachers.data || []);
    } catch (err) {
      toast.error("Gagal memuat data kelompok.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Async load for teachers
  const loadTeacherOptions = async (inputValue) => {
    try {
      const res = await request.get(API_ENDPOINTS.TEACHERS.LIST, {
        search: inputValue || "",
        limit: 50,
      });
      if (res.success) {
        return (res.data || []).map((t) => ({
          value: t.id,
          label: `${t.full_name} (${t.gender === "L" ? "Ustadz" : "Ustadzah"} - ${t.nip || "NIP Belum Diisi"})`,
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const handleOpenCreate = () => {
    setSelectedGroup(null);
    setFormData({
      name: "",
      teacher_id: "",
      description: "",
      schedule_days: "Senin - Jumat",
      schedule_time: "16:00 - 17:30",
      target_description: "Target Juz 30 & 29",
      is_active: 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name || "",
      teacher_id: group.teacher_id || "",
      description: group.description || "",
      schedule_days: group.schedule_days || "Senin - Jumat",
      schedule_time: group.schedule_time || "16:00 - 17:30",
      target_description: group.target_description || "Target Juz 30 & 29",
      is_active: group.is_active ? 1 : 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (group) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selectedGroup) {
        const res = await request.put(API_ENDPOINTS.GROUPS.UPDATE(selectedGroup.id), formData);
        if (res.success) {
          toast.success("Kelompok berhasil diperbarui!");
          setIsFormOpen(false);
          fetchData();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.GROUPS.CREATE, formData);
        if (res.success) {
          toast.success("Kelompok baru berhasil dibuat!");
          setIsFormOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan kelompok.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroup) return;
    setDeleteLoading(true);
    try {
      const res = await request.delete(API_ENDPOINTS.GROUPS.DELETE(selectedGroup.id));
      if (res.success) {
        toast.success("Kelompok berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus kelompok.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "Nama Kelompok",
      accessor: "name",
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{row.name}</h4>
          <p className="text-xs text-slate-500 line-clamp-1">{row.description || "-"}</p>
        </div>
      ),
    },
    {
      header: "Guru Pembimbing",
      accessor: "teacher_name",
      render: (row) => (
        <span className="font-semibold text-slate-700 text-xs">
          {row.teacher_name ? `Ust. ${row.teacher_name}` : "Belum ditentukan"}
        </span>
      ),
    },
    {
      header: "Jadwal & Waktu",
      accessor: "schedule_days",
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            {row.schedule_days}
          </p>
          <p className="text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {row.schedule_time}
          </p>
        </div>
      ),
    },
    {
      header: "Target Hafalan",
      accessor: "target_description",
      render: (row) => (
        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
          {row.target_description || "Target Juz 30"}
        </span>
      ),
    },
    {
      header: "Santri",
      accessor: "total_students",
      render: (row) => (
        <Badge variant="blue" size="sm">
          {row.total_students || 0} Santri
        </Badge>
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
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit Kelompok"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Kelompok"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Manajemen Kelompok Tahfidz
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bagi santri ke dalam kelompok halaqah dan tentukan ustadz pembimbingnya.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus} className="shadow-lg shadow-emerald-600/20">
          Buat Kelompok Baru
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={groups}
          loading={loading}
          emptyTitle="Belum Ada Kelompok"
          emptyDescription="Silakan buat kelompok tahfidz seperti Tahfidz A, Remaja, atau Anak-Anak."
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedGroup ? "Edit Kelompok Tahfidz" : "Buat Kelompok Baru"}
        subtitle="Tentukan nama kelompok, pembimbing, target hafalan, dan jadwal pertemuan."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Nama Kelompok / Halaqah"
            placeholder="Contoh: Tahfidz A (Ikhwan Unggulan)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <AsyncSelect
            label="Guru / Ustadz Pembimbing (Search by API)"
            placeholder="Ketik nama atau NIP guru..."
            loadOptions={loadTeacherOptions}
            value={
              formData.teacher_id
                ? {
                    value: formData.teacher_id,
                    label:
                      teachers.find((t) => String(t.id) === String(formData.teacher_id))?.full_name ||
                      "Guru Terpilih",
                  }
                : null
            }
            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hari Jadwal"
              placeholder="Contoh: Senin - Jumat"
              value={formData.schedule_days}
              onChange={(e) => setFormData({ ...formData, schedule_days: e.target.value })}
            />
            <Input
              label="Jam Pertemuan"
              placeholder="Contoh: 16:00 - 17:30"
              value={formData.schedule_time}
              onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
            />
          </div>

          <Input
            label="Target Hafalan Kelompok"
            placeholder="Contoh: Target Khatam Juz 30 & 29"
            value={formData.target_description}
            onChange={(e) => setFormData({ ...formData, target_description: e.target.value })}
          />

          <Textarea
            label="Deskripsi / Catatan Kelompok"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {selectedGroup ? "Simpan Perubahan" : "Buat Kelompok"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kelompok"
        message={`Apakah Anda yakin ingin menghapus kelompok ${selectedGroup?.name}?`}
        loading={deleteLoading}
      />
    </div>
  );
}
