import React, { useState, useEffect } from "react";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { Table } from "../../components/common/Table";
import { SearchInput } from "../../components/common/SearchInput";
import { Badge } from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { Eye, GraduationCap, Phone } from "lucide-react";
import toast from "react-hot-toast";

export function MyStudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.STUDENTS.LIST, { search, limit: 100 });
        if (res.success) {
          setStudents(res.data);
        }
      } catch (err) {
        toast.error("Gagal memuat daftar santri binaan.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [search]);

  const columns = [
    {
      header: "Santri",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {row.full_name?.charAt(0)}
          </div>
          <div>
            <p
              className="font-bold text-slate-800 text-sm hover:text-emerald-700 cursor-pointer"
              onClick={() => navigate(`/students/${row.id}`)}
            >
              {row.full_name}
            </p>
            <p className="text-xs text-slate-400">NIS: {row.nis}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Kelompok",
      accessor: "group_name",
      render: (row) => (
        <span className="font-semibold text-xs text-slate-700">
          {row.group_name || "Belum ada kelompok"}
        </span>
      ),
    },
    {
      header: "Target Hafalan",
      accessor: "target_juz",
      render: (row) => (
        <Badge variant="emerald" size="sm">
          {row.target_juz || "Juz 30"}
        </Badge>
      ),
    },
    {
      header: "Wali & Kontak",
      accessor: "parent_name",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{row.parent_name || "-"}</p>
          <p className="text-slate-400">{row.parent_phone || "-"}</p>
        </div>
      ),
    },
    {
      header: "Aksi",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/students/${row.id}`)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          Lihat Profil
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Santri Binaan</h2>
          <p className="text-xs text-slate-500">Santri yang terdaftar dalam kelompok halaqah yang Anda bimbing</p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari santri binaan..."
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={students}
        loading={loading}
        emptyTitle="Belum Ada Santri Binaan"
        emptyDescription="Santri yang terhubung dengan kelompok Anda akan ditampilkan di sini."
      />
    </div>
  );
}
