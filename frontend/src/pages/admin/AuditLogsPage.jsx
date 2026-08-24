import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { formatIndoDate } from "../../utils/helpers";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    page,
    limit,
    total,
    totalPages,
    setPage,
    handleLimitChange,
    updatePagination,
  } = usePagination(20);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.AUDIT_LOGS.LIST, { page, limit });
      if (res.success) {
        setLogs(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error("Gagal memuat audit log.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, updatePagination]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      header: "Waktu",
      accessor: "created_at",
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatIndoDate(row.created_at)}
        </span>
      ),
    },
    {
      header: "Pelaku (User)",
      accessor: "user_name",
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-800">{row.user_name || "System"}</p>
          <span className="text-[10px] text-slate-400 capitalize">{row.user_role}</span>
        </div>
      ),
    },
    {
      header: "Aksi",
      accessor: "action",
      render: (row) => (
        <Badge variant="blue" size="sm">
          {row.action}
        </Badge>
      ),
    },
    {
      header: "Entitas",
      accessor: "entity_type",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.entity_type} (ID: {row.entity_id || "-"})
        </span>
      ),
    },
    {
      header: "Detail Perubahan",
      accessor: "new_values",
      render: (row) => (
        <p className="text-[11px] font-mono text-slate-500 max-w-sm truncate" title={row.new_values || ""}>
          {row.new_values || "-"}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Trail & Riwayat Perubahan</h2>
          <p className="text-xs text-slate-500">Mencatat seluruh aksi penting demi transparansi dan integritas data yayasan</p>
        </div>
      </div>

      <div className="space-y-2">
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          emptyTitle="Belum Ada Log Aktivitas"
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          limitOptions={[20, 50, 100]}
        />
      </div>
    </div>
  );
}
