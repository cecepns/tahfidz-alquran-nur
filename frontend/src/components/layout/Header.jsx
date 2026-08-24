import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu, ChevronLeft, ChevronRight, User, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export function Header({ onMenuClick, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Institution title */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            Yayasan Tahfidz Alquran Nur
          </h1>
          <p className="text-[11px] text-slate-500">
            Membina Generasi Qur'ani Berakhlakul Karimah
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800">{user?.username}</span>
            <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
