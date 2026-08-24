import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { formatIndoDate } from "../../utils/helpers";
import toast from "react-hot-toast";

export function MyHistorySantri() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    page,
    limit,
    total,
    totalPages,
    setPage,
    handleLimitChange,
    updatePagination,
  } = usePagination(10);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.LIST, { page, limit });
      if (res.success) {
        setReports(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error("Gagal memuat riwayat hafalan.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, updatePagination]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns = [
    {
      header: "Tanggal Setor",
      accessor: "date",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {formatIndoDate(row.date, { weekday: "short" })}
        </span>
      ),
    },
    {
      header: "Jenis Setoran",
      accessor: "type",
      render: (row) => <ReportTypeBadge type={row.type} />,
    },
    {
      header: "Surah & Ayat",
      accessor: "surah_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-800">Surah {row.surah_name || "-"}</p>
          <p className="text-slate-500">Ayat {row.start_ayah} - {row.end_ayah} ({row.total_ayahs} Ayat)</p>
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
      header: "Catatan Bimbingan Ustadz",
      accessor: "notes",
      render: (row) => (
        <p className="text-xs text-slate-600 italic" title={row.notes}>
          "{row.notes || "Hafalan telah disetorkan."}"
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Riwayat Setoran & Murojaah Saya</h2>
        <p className="text-xs text-slate-500">Laporan catatan bimbingan dari guru pembimbing halaqah</p>
      </div>

      <div className="space-y-2">
        <Table
          columns={columns}
          data={reports}
          loading={loading}
          emptyTitle="Belum Ada Setoran"
          emptyDescription="Anda belum melakukan setoran hafalan baru atau murojaah."
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
