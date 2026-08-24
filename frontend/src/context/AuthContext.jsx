import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";
import { API_ENDPOINTS } from "../utils/endpoints";
import { request } from "../utils/request";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("tahfidz_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("tahfidz_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await request.get(API_ENDPOINTS.AUTH.ME);
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem("tahfidz_user", JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Auth verification failed:", err);
          logout(false);
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("tahfidz_token", res.token);
        localStorage.setItem("tahfidz_user", JSON.stringify(res.user));
        toast.success(`Selamat datang, ${res.user.username}!`);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || "Gagal masuk. Periksa username dan password.");
      return { success: false, message: err.message };
    }
  };

  const logout = (showToast = true) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("tahfidz_token");
    localStorage.removeItem("tahfidz_user");
    if (showToast) {
      toast.success("Anda telah keluar dari aplikasi.");
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem("tahfidz_user", JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === "admin",
    isGuru: user?.role === "guru",
    isSantri: user?.role === "santri",
    isParent: user?.role === "orang_tua",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
