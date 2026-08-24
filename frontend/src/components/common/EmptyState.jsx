import React from "react";
import { FolderOpen, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title = "Belum Ada Data",
  description = "Tidak ada data yang tersedia saat ini.",
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white border border-dashed border-slate-200 my-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function LoadingSpinner({ text = "Memuat data...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
      {text && <p className="mt-3 text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-slate-100 rounded-t-xl mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3.5 px-4 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-slate-100 rounded ${
                j === 0 ? "w-1/4" : j === cols - 1 ? "w-16" : "w-1/3"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
