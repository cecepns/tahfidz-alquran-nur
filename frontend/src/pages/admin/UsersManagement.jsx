import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { formatIndoDate } from "../../utils/helpers";
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
        setUsers(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error("Gagal mengambil data akun pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, updatePagination]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      header: "Username",
      accessor: "username",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {row.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">@{row.username}</p>
            <p className="text-xs text-slate-400">{row.email || "-"}</p>
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
        <Badge variant={row.status === "active" ? "emerald" : "rose"} size="sm">
          {row.status === "active" ? "Aktif" : "Nonaktif"}
        </Badge>
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna & Hak Akses</h2>
        <p className="text-xs text-slate-500">Daftar seluruh akun login yang terdaftar di Yayasan Tahfidz Alquran Nur</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari username atau email..."
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
              { value: "orang_tua", label: "Orang Tua" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="Belum Ada User"
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
    </div>
  );
}
