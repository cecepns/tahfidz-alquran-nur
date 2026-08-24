import React from "react";
import { SCORE_MAP, REPORT_TYPE_MAP, ATTENDANCE_STATUS_MAP } from "../../utils/helpers";

export function Badge({ children, variant = "default", size = "md", className = "" }) {
  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    emerald: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border border-amber-200",
    rose: "bg-rose-100 text-rose-800 border border-rose-200",
    blue: "bg-blue-100 text-blue-800 border border-blue-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizes[size] || sizes.md} ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function ScoreBadge({ score, size = "md" }) {
  const meta = SCORE_MAP[score] || {
    label: score || "-",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-lg border shadow-xs ${
        meta.badge
      } ${
        size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-3 py-1.5 text-base font-extrabold" : "px-2.5 py-1 text-xs"
      }`}
      title={meta.label}
    >
      Nilai {score}
    </span>
  );
}

export function ReportTypeBadge({ type }) {
  const meta = REPORT_TYPE_MAP[type] || {
    label: type,
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

export function AttendanceBadge({ status }) {
  const meta = ATTENDANCE_STATUS_MAP[status] || {
    label: status || "-",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.badge}`}>
      {meta.label}
    </span>
  );
}
