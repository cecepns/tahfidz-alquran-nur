import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Zap,
  GraduationCap,
  History,
  TrendingUp,
  User,
  BookOpen,
} from "lucide-react";

export function BottomNav() {
  const { user, isAdmin, isGuru, isSantri, isParent } = useAuth();

  const guruNav = [
    { label: "Beranda", path: "/guru", icon: LayoutDashboard },
    { label: "Quick Setor", path: "/guru/quick-input", icon: Zap, highlight: true },
    { label: "Santri", path: "/guru/students", icon: GraduationCap },
    { label: "Riwayat", path: "/guru/history", icon: History },
    { label: "Profil", path: "/profile", icon: User },
  ];

  const adminNav = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Santri", path: "/admin/students", icon: GraduationCap },
    { label: "Laporan", path: "/admin/reports", icon: BookOpen },
    { label: "Profil", path: "/profile", icon: User },
  ];

  const santriNav = [
    { label: "Beranda", path: "/santri", icon: LayoutDashboard },
    { label: "Progress", path: "/santri/progress", icon: TrendingUp },
    { label: "Riwayat", path: "/santri/history", icon: History },
    { label: "Profil", path: "/profile", icon: User },
  ];

  const parentNav = [
    { label: "Dashboard", path: "/parent", icon: LayoutDashboard },
    { label: "Profil", path: "/profile", icon: User },
  ];

  const navItems = isGuru
    ? guruNav
    : isAdmin
    ? adminNav
    : isSantri
    ? santriNav
    : parentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 lg:hidden px-2 py-1 shadow-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin" || item.path === "/guru" || item.path === "/santri" || item.path === "/parent"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  item.highlight
                    ? "-top-3 bg-emerald-600 text-white shadow-lg p-2.5 rounded-2xl ring-4 ring-white"
                    : isActive
                    ? "text-emerald-600 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`
              }
            >
              <Icon className={`w-5 h-5 ${item.highlight ? "w-6 h-6" : ""}`} />
              <span className={`text-[10px] mt-0.5 ${item.highlight ? "text-[11px] font-bold" : ""}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
