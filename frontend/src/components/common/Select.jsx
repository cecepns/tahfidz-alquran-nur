import React, { forwardRef } from "react";
import ReactSelect from "react-select";
import AsyncReactSelect from "react-select/async";

// Custom styles for React-Select matching Emerald Design System
const customSelectStyles = (error, isSmall) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled ? "#f8fafc" : "#ffffff",
    borderColor: error
      ? "#f43f5e"
      : state.isFocused
      ? "#059669"
      : "#e2e8f0",
    borderRadius: "0.75rem", // rounded-xl
    minHeight: isSmall ? "36px" : "42px",
    boxShadow: state.isFocused
      ? error
        ? "0 0 0 3px rgba(244, 63, 94, 0.15)"
        : "0 0 0 3px rgba(5, 150, 105, 0.15)"
      : "none",
    "&:hover": {
      borderColor: error ? "#f43f5e" : "#cbd5e1",
    },
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    cursor: "pointer",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: isSmall ? "2px 10px" : "4px 12px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "#1e293b",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1e293b",
    fontWeight: "500",
    fontSize: "0.875rem",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.875rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    zIndex: 9999,
    padding: "4px",
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: "220px",
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "0.5rem",
    padding: "8px 12px",
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#059669"
      : state.isFocused
      ? "#ecfdf5"
      : "transparent",
    color: state.isSelected
      ? "#ffffff"
      : state.isFocused
      ? "#065f46"
      : "#334155",
    fontWeight: state.isSelected ? "600" : "400",
    transition: "background-color 0.15s ease",
    "&:active": {
      backgroundColor: "#059669",
      color: "#ffffff",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#059669" : "#94a3b8",
    padding: "6px 8px",
    "&:hover": {
      color: "#059669",
    },
    transition: "transform 0.2s ease, color 0.2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    padding: "6px 8px",
    "&:hover": {
      color: "#f43f5e",
    },
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: "#059669",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
});

/**
 * Standard React-Select with Searchable & Clean Emerald Styling
 */
export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    value,
    onChange,
    error,
    helperText,
    icon: Icon,
    className = "",
    containerClassName = "",
    placeholder = "Pilih opsi...",
    required = false,
    isClearable = true,
    isSearchable = true,
    isSmall = false,
    disabled = false,
    name,
    id,
    actionButton,
    ...props
  },
  ref
) {
  // Normalize formatted options
  const formattedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label !== undefined ? opt.label : (opt.name || String(opt.value)),
        ...opt,
      };
    }
    return { value: opt, label: String(opt) };
  });

  // Find selected option object from current value
  const selectedOption = formattedOptions.find(
    (opt) => String(opt.value) === String(value)
  ) || (value === "" || value === null || value === undefined ? null : { value, label: String(value) });

  const handleChange = (selected) => {
    if (!onChange) return;
    const selectedVal = selected ? selected.value : "";
    // Support both standard synthetic event or direct value
    onChange({
      target: {
        name: name || id || "",
        value: selectedVal,
      },
      option: selected,
    });
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 tracking-wide">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {actionButton}
      </div>

      <div className="relative">
        <ReactSelect
          ref={ref}
          options={formattedOptions}
          value={selectedOption}
          onChange={handleChange}
          isClearable={isClearable && !required}
          isSearchable={isSearchable}
          isDisabled={disabled}
          placeholder={placeholder}
          styles={customSelectStyles(error, isSmall)}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          menuPosition="fixed"
          noOptionsMessage={() => "Tidak ada data ditemukan"}
          loadingMessage={() => "Memuat pilihan..."}
          className={`react-select-container ${className}`}
          classNamePrefix="react-select"
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

/**
 * Async React-Select for Searching by API
 */
export const AsyncSelect = forwardRef(function AsyncSelect(
  {
    label,
    loadOptions,
    defaultOptions = true,
    value,
    onChange,
    error,
    helperText,
    className = "",
    containerClassName = "",
    placeholder = "Ketik untuk mencari...",
    required = false,
    isClearable = true,
    isSmall = false,
    disabled = false,
    name,
    id,
    actionButton,
    ...props
  },
  ref
) {
  const handleChange = (selected) => {
    if (!onChange) return;
    const selectedVal = selected ? selected.value : "";
    onChange({
      target: {
        name: name || id || "",
        value: selectedVal,
      },
      option: selected,
    });
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 tracking-wide">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {actionButton}
      </div>

      <div className="relative">
        <AsyncReactSelect
          ref={ref}
          cacheOptions
          defaultOptions={defaultOptions}
          loadOptions={loadOptions}
          value={value}
          onChange={handleChange}
          isClearable={isClearable && !required}
          isDisabled={disabled}
          placeholder={placeholder}
          styles={customSelectStyles(error, isSmall)}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          menuPosition="fixed"
          noOptionsMessage={({ inputValue }) =>
            inputValue ? `Tidak ada hasil untuk "${inputValue}"` : "Ketik untuk mencari..."
          }
          loadingMessage={() => "Mencari dari server..."}
          className={`react-select-async-container ${className}`}
          classNamePrefix="react-select"
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});
