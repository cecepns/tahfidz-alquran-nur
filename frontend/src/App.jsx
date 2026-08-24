import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingSpinner } from "./components/common/EmptyState";

// Auth & Shared Pages
import { LoginPage } from "./pages/shared/LoginPage";
import { ProfilePage } from "./pages/shared/ProfilePage";
import { StudentDetailPage } from "./pages/shared/StudentDetailPage";
import { NotFoundPage } from "./pages/shared/NotFoundPage";

// Admin Pages
import { DashboardAdmin } from "./pages/admin/DashboardAdmin";
import { StudentsManagement } from "./pages/admin/StudentsManagement";
import { TeachersManagement } from "./pages/admin/TeachersManagement";
import { GroupsManagement } from "./pages/admin/GroupsManagement";
import { ReportsManagement } from "./pages/admin/ReportsManagement";
import { UsersManagement } from "./pages/admin/UsersManagement";
import { ParentsManagement } from "./pages/admin/ParentsManagement";
import { AuditLogsPage } from "./pages/admin/AuditLogsPage";

// Guru Pages
import { DashboardGuru } from "./pages/guru/DashboardGuru";
import { QuickInputPage } from "./pages/guru/QuickInputPage";
import { MyStudentsList } from "./pages/guru/MyStudentsList";
import { AttendanceGuru } from "./pages/guru/AttendanceGuru";
import { SetoranHistoryGuru } from "./pages/guru/SetoranHistoryGuru";

// Santri Pages
import { DashboardSantri } from "./pages/santri/DashboardSantri";
import { MyHafalanProgress } from "./pages/santri/MyHafalanProgress";
import { MyHistorySantri } from "./pages/santri/MyHistorySantri";

// Parent Pages
import { DashboardParent } from "./pages/parent/DashboardParent";

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Memeriksa sesi pengguna..." className="min-h-screen" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective default dashboard if role doesn't match
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "guru") return <Navigate to="/guru" replace />;
    if (user.role === "santri") return <Navigate to="/santri" replace />;
    if (user.role === "orang_tua") return <Navigate to="/parent" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Root Redirection based on role
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner text="Memuat aplikasi..." className="min-h-screen" />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "guru") return <Navigate to="/guru" replace />;
  if (user.role === "santri") return <Navigate to="/santri" replace />;
  if (user.role === "orang_tua") return <Navigate to="/parent" replace />;
  return <Navigate to="/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Main Authenticated Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeachersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GroupsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ParentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Guru Routes */}
        <Route
          path="/guru"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <DashboardGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/quick-input"
          element={
            <ProtectedRoute allowedRoles={["guru", "admin"]}>
              <QuickInputPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/students"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <MyStudentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/attendance"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <AttendanceGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/history"
          element={
            <ProtectedRoute allowedRoles={["guru"]}>
              <SetoranHistoryGuru />
            </ProtectedRoute>
          }
        />

        {/* Santri Routes */}
        <Route
          path="/santri"
          element={
            <ProtectedRoute allowedRoles={["santri"]}>
              <DashboardSantri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/santri/progress"
          element={
            <ProtectedRoute allowedRoles={["santri"]}>
              <MyHafalanProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/santri/history"
          element={
            <ProtectedRoute allowedRoles={["santri"]}>
              <MyHistorySantri />
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["orang_tua"]}>
              <DashboardParent />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
