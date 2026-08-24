import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { ConfirmModal } from "./ConfirmModal";
import { request } from "../../utils/request";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { Plus, Edit2, Trash2, BookmarkCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function TargetOptionsModal({ isOpen, onClose, onOptionsUpdated }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState("list"); // 'list', 'create', 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.TARGET_OPTIONS.LIST);
      if (res.success) {
        setOptions(res.data || []);
        if (onOptionsUpdated) onOptionsUpdated(res.data || []);
      }
    } catch (err) {
      toast.error("Gagal memuat opsi target hafalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      setFormMode("list");
      setName("");
      setDescription("");
    }
  }, [isOpen]);

  const handleCreate = () => {
    setActiveItem(null);
    setName("");
    setDescription("");
    setFormMode("create");
  };

  const handleEdit = (item) => {
    setActiveItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setFormMode("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama target wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      if (formMode === "create") {
        const res = await request.post(API_ENDPOINTS.TARGET_OPTIONS.CREATE, {
          name: name.trim(),
          description: description.trim(),
        });
        if (res.success) {
          toast.success("Opsi target baru berhasil ditambahkan!");
          setFormMode("list");
          fetchOptions();
        }
      } else if (formMode === "edit" && activeItem) {
        const res = await request.put(API_ENDPOINTS.TARGET_OPTIONS.UPDATE(activeItem.id), {
          name: name.trim(),
          description: description.trim(),
        });
        if (res.success) {
          toast.success("Opsi target berhasil diperbarui!");
          setFormMode("list");
          fetchOptions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan opsi target.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await request.delete(API_ENDPOINTS.TARGET_OPTIONS.DELETE(deleteConfirm.id));
      if (res.success) {
        toast.success("Opsi target berhasil dihapus!");
        setDeleteConfirm({ open: false, id: null, name: "" });
        fetchOptions();
      }
    } catch (err) {
      toast.error("Gagal menghapus opsi target.");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Kelola Master Target Hafalan"
        subtitle="Tambah, edit, atau hapus opsi target hafalan santri secara dinamis."
        maxWidth="max-w-xl"
      >
        {formMode === "list" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Daftar Opsi Target ({options.length})
              </span>
              <Button size="sm" variant="primary" icon={Plus} onClick={handleCreate}>
                Tambah Target Baru
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-emerald-600 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Memuat master target...</span>
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada opsi target. Klik tombol di atas untuk menambahkan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
                        <BookmarkCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{opt.name}</h4>
                        {opt.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(opt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Edit Target"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ open: true, id: opt.id, name: opt.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 text-xs text-emerald-800">
              <span className="font-bold">
                {formMode === "create" ? "Tambah Target Hafalan Baru" : "Edit Target Hafalan"}
              </span>
              <p className="text-emerald-700/90 mt-0.5">
                Target yang ditambahkan akan langsung muncul di pilihan dropdown santri.
              </p>
            </div>

            <Input
              label="Nama Target Hafalan"
              placeholder="Contoh: Juz 30 (An-Naba s.d An-Nas) atau Target 15 Juz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Deskripsi / Keterangan (Opsional)"
              placeholder="Contoh: Target tingkat dasar santri baru"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormMode("list")}
                disabled={saving}
              >
                Kembali
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                {formMode === "create" ? "Simpan Target" : "Perbarui Target"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: "" })}
        onConfirm={handleDelete}
        title="Hapus Opsi Target?"
        message={`Apakah Anda yakin ingin menghapus target "${deleteConfirm.name}"? Pilihan ini tidak akan muncul lagi di formulir santri baru.`}
        variant="danger"
        confirmText="Hapus Target"
      />
    </>
  );
}
