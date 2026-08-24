import { useState, useCallback } from "react";

export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const updatePagination = useCallback((meta) => {
    if (!meta) return;
    if (meta.page) setPage(meta.page);
    if (meta.limit) setLimit(meta.limit);
    if (meta.total !== undefined) setTotal(meta.total);
    if (meta.totalPages) setTotalPages(meta.totalPages);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 on limit change
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    updatePagination,
    handlePageChange,
    handleLimitChange,
    resetPage,
  };
}
