import React from "react";
import { TableSkeleton, EmptyState } from "./EmptyState";
import { AlertCircle } from "lucide-react";

export function Table({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyTitle = "Data tidak ditemukan",
  emptyDescription = "Belum ada catatan data yang cocok dengan kriteria pencarian.",
  onRowClick,
  className = "",
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <TableSkeleton rows={6} cols={columns.length} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-rose-800">Gagal Memuat Data</h4>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.className || ""} ${
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/80 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3.5 px-4 text-slate-700 ${col.className || ""} ${
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
