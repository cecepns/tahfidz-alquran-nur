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
import { Badge } from "../../components/common/Badge";
import { Plus, Edit2, Trash2, Users, Phone, Mail, MapPin, UserCheck, Shield } from "lucide-react";
import toast from "react-hot-toast";

export function ParentsManagement() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
  const [selectedParent, setSelectedParent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    username: "",
    password: "",
  });

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PARENTS.LIST, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setParents(res.data || []);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Gagal memuat data wali santri.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, updatePagination]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleOpenCreate = () => {
    setSelectedParent(null);
    setFormData({
      full_name: "",
      phone: "",
      email: "",
      address: "",
      username: "",
      password: "password123",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (parent) => {
    setSelectedParent(parent);
    setFormData({
      full_name: parent.full_name || "",
      phone: parent.phone || "",
      email: parent.email || "",
      address: parent.address || "",
      username: parent.username || "",
      password: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (parent) => {
    setSelectedParent(parent);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      toast.error("Nama lengkap dan nomor HP wajib diisi.");
      return;
    }
    if (!selectedParent && (!formData.username || !formData.password)) {
      toast.error("Username dan password wajib diisi untuk akun baru.");
      return;
    }

    setFormLoading(true);
    try {
      if (selectedParent) {
        const res = await request.put(
          API_ENDPOINTS.PARENTS.UPDATE(selectedParent.id),
          formData
        );
        if (res.success) {
          toast.success("Data wali santri berhasil diperbarui!");
          setIsFormOpen(false);
          fetchParents();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.PARENTS.CREATE, formData);
        if (res.success) {
          toast.success("Wali santri baru berhasil didaftarkan!");
          setIsFormOpen(false);
          fetchParents();
        }
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan data wali santri.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedParent) return;
    setDeleteLoading(true);
    try {
      const res = await request.delete(
        API_ENDPOINTS.PARENTS.DELETE(selectedParent.id)
      );
      if (res.success) {
        toast.success("Data wali santri berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchParents();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus data wali santri.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "Nama Wali & Akun",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
            {row.full_name?.charAt(0)?.toUpperCase() || "W"}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{row.full_name}</p>
            <p className="text-xs text-slate-400">@{row.username || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Kontak",
      accessor: "phone",
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{row.phone || "-"}</span>
          </div>
          {row.email && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Alamat",
      accessor: "address",
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-[200px]" title={row.address}>
          {row.address || "-"}
        </span>
      ),
    },
    {
      header: "Santri Terhubung",
      accessor: "total_children",
      render: (row) => (
        <Badge variant={row.total_children > 0 ? "emerald" : "default"} size="sm">
          {row.total_children || 0} Santri
        </Badge>
      ),
    },
    {
      header: "Status Akun",
      accessor: "user_status",
      render: (row) => (
        <Badge variant={row.user_status === "active" ? "emerald" : "rose"} size="sm">
          {row.user_status === "active" ? "Aktif" : "Nonaktif"}
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
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Wali Santri"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Wali Santri"
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
          <h2 className="text-xl font-bold text-slate-800">Manajemen Wali Santri</h2>
          <p className="text-xs text-slate-500">
            Kelola data orang tua / wali santri dan akun akses login untuk memantau hafalan anak
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Tambah Wali Santri
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
          placeholder="Cari nama wali, no WhatsApp, email, username..."
        />
      </div>

      {/* Table */}
      <div className="space-y-2">
        <Table
          columns={columns}
          data={parents}
          loading={loading}
          emptyTitle="Belum Ada Data Wali Santri"
          emptyDescription="Silakan daftarkan wali santri untuk memberikan akses portal wali."
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
        title={selectedParent ? "Edit Data Wali Santri" : "Tambah Wali Santri Baru"}
        subtitle="Data wali santri akan terhubung dengan akun login portal orang tua."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Nama Lengkap Wali Santri"
              placeholder="Contoh: H. Bambang Sudirman"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor WhatsApp / HP"
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Alamat Email (Opsional)"
                type="email"
                placeholder="orangtua@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Textarea
              label="Alamat Rumah / Domisili"
              placeholder="Alamat lengkap tempat tinggal..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-700">Akun Login Portal Wali Santri</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Username"
                  placeholder="username_wali"
                  value={formData.username}
                  disabled={!!selectedParent}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required={!selectedParent}
                />
                <Input
                  label={selectedParent ? "Reset Password (Opsional)" : "Password"}
                  type="password"
                  placeholder={selectedParent ? "Biarkan kosong jika tidak diubah" : "Minimal 6 karakter"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedParent}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" loading={formLoading}>
              {selectedParent ? "Simpan Perubahan" : "Daftarkan Wali Santri"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Wali Santri"
        message={`Apakah Anda yakin ingin menghapus data wali santri "${selectedParent?.full_name}"? Akun login yang bersangkutan juga akan dihapus.`}
        loading={deleteLoading}
      />
    </div>
  );
}
