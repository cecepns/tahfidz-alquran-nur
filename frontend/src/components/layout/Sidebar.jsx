import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckSquare,
  History,
  TrendingUp,
  Settings,
  ShieldCheck,
  Zap,
  LogOut,
  FolderGit2,
  CalendarDays,
  FileSpreadsheet,
  UserCheck,
} from "lucide-react";

export function Sidebar({ isOpen, onClose, collapsed, setCollapsed }) {
  const { user, logout, isAdmin, isGuru, isSantri, isParent } = useAuth();

  const adminMenu = [
    { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { title: "Santri", path: "/admin/students", icon: GraduationCap },
    { title: "Guru / Ustadz", path: "/admin/teachers", icon: Users },
    { title: "Wali Santri", path: "/admin/parents", icon: UserCheck },
    { title: "Kelompok Tahfidz", path: "/admin/groups", icon: FolderGit2 },
    { title: "Laporan Setoran", path: "/admin/reports", icon: BookOpen },
    { title: "Manajemen User", path: "/admin/users", icon: Settings },
    { title: "Audit Trail", path: "/admin/audit-logs", icon: ShieldCheck },
  ];

  const guruMenu = [
    { title: "Dashboard Guru", path: "/guru", icon: LayoutDashboard },
    { title: "Quick Input Setoran", path: "/guru/quick-input", icon: Zap, highlight: true },
    { title: "Santri Binaan", path: "/guru/students", icon: GraduationCap },
    { title: "Absensi Santri", path: "/guru/attendance", icon: CheckSquare },
    { title: "Riwayat Laporan", path: "/guru/history", icon: History },
  ];

  const santriMenu = [
    { title: "Dashboard Santri", path: "/santri", icon: LayoutDashboard },
    { title: "Progress Hafalan", path: "/santri/progress", icon: TrendingUp },
    { title: "Riwayat Setoran", path: "/santri/history", icon: History },
  ];

  const parentMenu = [
    { title: "Dashboard Orang Tua", path: "/parent", icon: LayoutDashboard },
  ];

  const menuItems = isAdmin
    ? adminMenu
    : isGuru
    ? guruMenu
    : isSantri
    ? santriMenu
    : parentMenu;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.jpeg"
              alt="Tahfidz Nur Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-xs flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-extrabold text-emerald-800 tracking-tight leading-tight truncate">
                  TAHFIDZ ALQURAN NUR
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                  Management System
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Quick Info */}
        {!collapsed && (
          <div className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm text-white flex-shrink-0 border border-white/30">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate">{user?.username}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 capitalize mt-0.5">
                  {user?.role === "orang_tua" ? "Wali Santri" : user?.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin" || item.path === "/guru" || item.path === "/santri" || item.path === "/parent"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.highlight && !isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100"
                      : isActive
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center px-2" : ""}`
                }
                title={collapsed ? item.title : ""}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${item.highlight ? "animate-pulse" : ""}`} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Keluar" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
