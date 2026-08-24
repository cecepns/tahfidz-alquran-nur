export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    ME: "/auth/me",
  },

  DASHBOARD: {
    STATS: "/dashboard/stats",
  },

  TEACHERS: {
    LIST: "/teachers",
    DETAIL: (id) => `/teachers/${id}`,
    CREATE: "/teachers",
    UPDATE: (id) => `/teachers/${id}`,
    DELETE: (id) => `/teachers/${id}`,
  },

  STUDENTS: {
    LIST: "/students",
    DETAIL: (id) => `/students/${id}`,
    CREATE: "/students",
    UPDATE: (id) => `/students/${id}`,
    DELETE: (id) => `/students/${id}`,
  },

  GROUPS: {
    LIST: "/groups",
    DETAIL: (id) => `/groups/${id}`,
    CREATE: "/groups",
    UPDATE: (id) => `/groups/${id}`,
    DELETE: (id) => `/groups/${id}`,
    STUDENTS: (id) => `/groups/${id}/students`,
  },

  REPORTS: {
    LIST: "/reports",
    DETAIL: (id) => `/reports/${id}`,
    CREATE: "/reports",
    QUICK_BATCH: "/reports/quick-batch",
    UPDATE: (id) => `/reports/${id}`,
    DELETE: (id) => `/reports/${id}`,
    EXPORT_CSV: "/reports/export/csv",
  },

  ATTENDANCE: {
    LIST: "/attendance",
    BULK: "/attendance/bulk",
  },

  TARGETS: {
    LIST: "/targets",
    CREATE: "/targets",
  },

  TARGET_OPTIONS: {
    LIST: "/target-options",
    CREATE: "/target-options",
    UPDATE: (id) => `/target-options/${id}`,
    DELETE: (id) => `/target-options/${id}`,
  },

  QURAN: {
    SURAHS: "/quran/surahs",
  },

  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  PARENTS: {
    LIST: "/parents",
    DETAIL: (id) => `/parents/${id}`,
    CREATE: "/parents",
    UPDATE: (id) => `/parents/${id}`,
    DELETE: (id) => `/parents/${id}`,
  },

  AUDIT_LOGS: {
    LIST: "/audit-logs",
  },

  UPLOAD: "/upload",
};
