import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Lock, User, Sparkles, BookOpen, Shield, GraduationCap, Users } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      if (res.user.role === "admin") navigate("/admin");
      else if (res.user.role === "guru") navigate("/guru");
      else if (res.user.role === "santri") navigate("/santri");
      else if (res.user.role === "orang_tua") navigate("/parent");
      else navigate("/");
    }
  };

  const handleQuickLogin = async (userAcc, passAcc) => {
    setUsername(userAcc);
    setPassword(passAcc);
    setLoading(true);
    const res = await login(userAcc, passAcc);
    setLoading(false);
    if (res.success) {
      if (res.user.role === "admin") navigate("/admin");
      else if (res.user.role === "guru") navigate("/guru");
      else if (res.user.role === "santri") navigate("/santri");
      else if (res.user.role === "orang_tua") navigate("/parent");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative islamic background shapes */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-4">
          <img
            src="/logo.jpeg"
            alt="Tahfidz Nur Logo"
            className="w-16 h-16 rounded-xl object-cover shadow-md"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Tahfidz Management System
        </h2>
        <p className="mt-1 text-sm text-emerald-200 font-medium">
          Yayasan Tahfidz Alquran Nur
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Username atau Email"
              placeholder="Masukkan username/email..."
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-lg shadow-emerald-600/30"
              >
                Masuk ke Sistem
              </Button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Demo Akun (1-Click Login)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin", "password123")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-emerald-700">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Admin
                </div>
                <span className="text-[11px] text-slate-400">admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("ustadz.ahmad", "password123")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-emerald-700">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Guru
                </div>
                <span className="text-[11px] text-slate-400">ustadz.ahmad</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("ahmad.fauzan", "password123")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-emerald-700">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  Santri
                </div>
                <span className="text-[11px] text-slate-400">ahmad.fauzan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("wali.ahmad", "password123")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-emerald-700">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Orang Tua
                </div>
                <span className="text-[11px] text-slate-400">wali.ahmad</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
