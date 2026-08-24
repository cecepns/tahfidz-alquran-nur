import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { User, Lock, Mail, Phone, Shield } from "lucide-react";
import toast from "react-hot-toast";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
    full_name: user?.profile?.full_name || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      return toast.error("Konfirmasi password baru tidak cocok.");
    }

    setLoading(true);
    try {
      const res = await request.put(API_ENDPOINTS.AUTH.PROFILE, formData);
      if (res.success) {
        toast.success("Profil berhasil diperbarui!");
        updateUser({
          email: formData.email,
          phone: formData.phone,
        });
        setFormData({ ...formData, current_password: "", new_password: "", confirm_password: "" });
      }
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pengaturan Profil & Akun</h2>
        <p className="text-xs text-slate-500">Kelola informasi kontak dan ubah kata sandi akun Anda</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">@{user?.username}</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alamat Email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Nomor WhatsApp / HP"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 mt-6">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Ganti Password (Opsional)
            </h4>
            <Input
              label="Password Saat Ini"
              type="password"
              placeholder="Masukkan password lama untuk konfirmasi"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password Baru"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              />
              <Input
                label="Ulangi Password Baru"
                type="password"
                placeholder="Konfirmasi password baru"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading}>
              Simpan Profil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
