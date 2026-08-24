import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

export function SearchInput({
  value = "",
  onChange,
  placeholder = "Cari data...",
  debounceMs = 350,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState(value);
  const debouncedSearch = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    if (debouncedSearch !== value) {
      onChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
  };

  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
