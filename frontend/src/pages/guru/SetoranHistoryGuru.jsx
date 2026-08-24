import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { usePagination } from "../../hooks/usePagination";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { ScoreBadge, ReportTypeBadge } from "../../components/common/Badge";
import { formatIndoDate } from "../../utils/helpers";
import toast from "react-hot-toast";

export function SetoranHistoryGuru() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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
      const res = await request.get(API_ENDPOINTS.REPORTS.LIST, {
        page,
        limit,
        search,
        type: typeFilter || undefined,
      });
      if (res.success) {
        setReports(res.data);
        updatePagination(res.pagination);
      }
    } catch (err) {
      toast.error("Gagal memuat riwayat setoran.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, typeFilter, updatePagination]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
          <p className="text-xs text-slate-400">NIS: {row.nis}</p>
        </div>
      ),
    },
    {
      header: "Jenis",
      accessor: "type",
      render: (row) => <ReportTypeBadge type={row.type} />,
    },
    {
      header: "Hafalan / Surah",
      accessor: "surah_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-emerald-800">Surah {row.surah_name || "-"}</p>
          <p className="text-slate-500">Ayat {row.start_ayah} - {row.end_ayah}</p>
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
      header: "Catatan Bimbingan",
      accessor: "notes",
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={row.notes}>
          {row.notes || "-"}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Riwayat Laporan Setoran Guru</h2>
        <p className="text-xs text-slate-500">Seluruh catatan hafalan & murojaah yang telah Anda berikan nilai</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari santri atau surah..."
        />
        <div className="w-full sm:w-56">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Jenis Laporan"
            options={[
              { value: "NEW_MEMORIZATION", label: "Hafalan Baru" },
              { value: "DAILY_MUROJAAH", label: "Murojaah Harian" },
              { value: "WEEKLY_MUROJAAH", label: "Murojaah Pekanan" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Table
          columns={columns}
          data={reports}
          loading={loading}
          emptyTitle="Belum Ada Riwayat"
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
