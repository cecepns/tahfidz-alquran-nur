import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-3xl mb-4">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link to="/">
        <Button icon={Home}>Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
