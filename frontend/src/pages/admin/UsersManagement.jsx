import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { formatIndoDate } from "../../utils/helpers";
import { Plus, Edit2, Trash2, Shield, User, Key, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "guru",
    status: "active",
    password: "",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        page,
        limit,
        search,
        role: roleFilter || undefined,
      });
      if (res.success) {
        setUsers(res.data || []);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Gagal mengambil data akun pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, updatePagination]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      username: "",
      email: "",
      phone: "",
      role: "guru",
      status: "active",
      password: "password123",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "santri",
      status: user.status || "active",
      password: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      toast.error("Username wajib diisi.");
      return;
    }
    if (!selectedUser && !formData.password) {
      toast.error("Password wajib diisi untuk pengguna baru.");
      return;
    }

    setFormLoading(true);
    try {
      if (selectedUser) {
        const res = await request.put(
          API_ENDPOINTS.USERS.UPDATE(selectedUser.id),
          formData
        );
        if (res.success) {
          toast.success("Akun pengguna berhasil diperbarui!");
          setIsFormOpen(false);
          fetchUsers();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.USERS.CREATE, formData);
        if (res.success) {
          toast.success("Akun pengguna baru berhasil dibuat!");
          setIsFormOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      toast.error(err.message || "Gagal menyimpan data pengguna.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    try {
      const res = await request.delete(
        API_ENDPOINTS.USERS.DELETE(selectedUser.id)
      );
      if (res.success) {
        toast.success("Akun pengguna berhasil dihapus.");
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Gagal menghapus pengguna.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      const res = await request.put(API_ENDPOINTS.USERS.UPDATE(user.id), {
        status: newStatus,
      });
      if (res.success) {
        toast.success(`Status akun @${user.username} diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui status akun.");
    }
  };

  const columns = [
    {
      header: "Username & Kontak",
      accessor: "username",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
            {row.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">@{row.username}</p>
            <p className="text-xs text-slate-400">
              {row.email || "-"} {row.phone ? `• ${row.phone}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Role / Hak Akses",
      accessor: "role",
      render: (row) => {
        const roleColors = {
          admin: "emerald",
          guru: "blue",
          santri: "purple",
          orang_tua: "amber",
        };
        const roleLabels = {
          admin: "Admin",
          guru: "Guru / Ustadz",
          santri: "Santri",
          orang_tua: "Orang Tua / Wali",
        };
        return (
          <Badge variant={roleColors[row.role] || "default"} size="sm">
            {roleLabels[row.role] || row.role}
          </Badge>
        );
      },
    },
    {
      header: "Status Akun",
      accessor: "status",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row)}
          className="focus:outline-none cursor-pointer"
          title="Klik untuk mengubah status aktif/nonaktif"
        >
          <Badge variant={row.status === "active" ? "emerald" : "rose"} size="sm">
            {row.status === "active" ? "Aktif" : "Nonaktif"}
          </Badge>
        </button>
      ),
    },
    {
      header: "Login Terakhir",
      accessor: "last_login_at",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.last_login_at ? formatIndoDate(row.last_login_at) : "Belum pernah"}
        </span>
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
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Pengguna"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Hapus Pengguna"
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
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna & Hak Akses</h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh akun login dan hak akses pengguna di Yayasan Tahfidz Alquran Nur
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Tambah Pengguna
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
          placeholder="Cari username, email, atau no HP..."
        />
        <div className="w-full sm:w-48">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Role"
            options={[
              { value: "admin", label: "Admin" },
              { value: "guru", label: "Guru / Ustadz" },
              { value: "santri", label: "Santri" },
              { value: "orang_tua", label: "Orang Tua / Wali" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="Belum Ada User"
          emptyDescription="Belum ada akun pengguna yang terdaftar sesuai filter pencarian."
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
        title={selectedUser ? "Edit Akun Pengguna" : "Tambah Pengguna Baru"}
        subtitle="Kelola username, hak akses (role), dan kata sandi akun."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Username Akun"
              placeholder="contoh: ustadz_ahmad"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Alamat Email (Opsional)"
                type="email"
                placeholder="user@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Nomor HP / WhatsApp"
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Hak Akses (Role)"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: "admin", label: "Admin (Pengelola)" },
                  { value: "guru", label: "Guru / Ustadz" },
                  { value: "santri", label: "Santri" },
                  { value: "orang_tua", label: "Orang Tua / Wali" },
                ]}
                required
              />
              <Select
                label="Status Akun"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-700">
                  {selectedUser ? "Reset Password" : "Password Akun"}
                </h4>
              </div>
              <Input
                label={selectedUser ? "Password Baru (Opsional)" : "Password"}
                type="password"
                placeholder={selectedUser ? "Biarkan kosong jika tidak ingin mengubah" : "Minimal 6 karakter"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!selectedUser}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Batal
            </Button>
            <Button type="submit" loading={formLoading}>
              {selectedUser ? "Simpan Perubahan" : "Buat Akun Pengguna"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "@${selectedUser?.username}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleteLoading}
      />
    </div>
  );
}
