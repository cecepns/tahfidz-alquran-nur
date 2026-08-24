import React from "react";

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  color = "emerald",
  size = "md",
  className = "",
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-400",
    blue: "bg-gradient-to-r from-blue-500 to-indigo-500",
    amber: "bg-gradient-to-r from-amber-400 to-orange-500",
    purple: "bg-gradient-to-r from-purple-500 to-pink-500",
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span className="text-emerald-700">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightStyles[size] || heightStyles.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color] || colorStyles.emerald}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
