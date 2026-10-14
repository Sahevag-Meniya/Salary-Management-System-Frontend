import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import Select from 'react-select';

const filterSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.5rem',
    minHeight: '38px',
    height: '38px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
    fontSize: '0.8125rem',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: '0.8125rem',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#64748b',
    fontSize: '0.8125rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '500',
    fontSize: '0.8125rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    padding: '6px 12px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    border: '1px solid #e2e8f0',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '2px',
    cursor: 'pointer',
    color: '#94a3b8',
    '&:hover': {
      color: '#64748b',
    },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px',
    color: '#94a3b8',
  }),
};

export default function FilterBar({ filters, setFilters, filterOptions = {}, onReset }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [minSalary, setMinSalary] = useState(filters.minSalary || '');
  const [maxSalary, setMaxSalary] = useState(filters.maxSalary || '');

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => {
        if (prev.search === searchTerm) return prev;
        return { ...prev, search: searchTerm, page: 1 };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce Net Salary Range update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => {
        if (prev.minSalary === minSalary && prev.maxSalary === maxSalary) return prev;
        return { ...prev, minSalary, maxSalary, page: 1 };
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [minSalary, maxSalary]);

  // Sync external search and salary changes (e.g. from URL popstate / back button / reset)
  useEffect(() => {
    if ((filters.search || '') !== searchTerm) {
      setSearchTerm(filters.search || '');
    }
  }, [filters.search]);

  useEffect(() => {
    if ((filters.minSalary || '') !== minSalary) {
      setMinSalary(filters.minSalary || '');
    }
  }, [filters.minSalary]);

  useEffect(() => {
    if ((filters.maxSalary || '') !== maxSalary) {
      setMaxSalary(filters.maxSalary || '');
    }
  }, [filters.maxSalary]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setMinSalary('');
    setMaxSalary('');
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false;
    return val !== '' && val !== undefined && val !== null;
  }).length;

  const countryOptions = (filterOptions.countries || []).map(c => ({ value: c, label: c }));
  const departmentOptions = (filterOptions.departments || []).map(d => ({ value: d, label: d }));
  const currencyOptions = (filterOptions.currencies || []).map(curr => ({ value: curr, label: curr }));

  const designationOptions = React.useMemo(() => {
    if (filters.department && filterOptions.designationList?.length > 0) {
      const filtered = filterOptions.designationList.filter(
        d => d.departmentName.toLowerCase() === filters.department.toLowerCase()
      );
      if (filtered.length > 0) {
        return filtered.map(r => ({ value: r.name, label: r.name }));
      }
    }
    return (filterOptions.designations || []).map(r => ({ value: r, label: r }));
  }, [filters.department, filterOptions]);

  const handleDepartmentFilterChange = (opt) => {
    const newDept = opt ? opt.value : '';
    let newDesig = filters.designation;
    if (newDept && filters.designation && filterOptions.designationList) {
      const isValid = filterOptions.designationList.some(
        d => d.name === filters.designation && d.departmentName.toLowerCase() === newDept.toLowerCase()
      );
      if (!isValid) newDesig = '';
    }
    setFilters(prev => ({ ...prev, department: newDept, designation: newDesig, page: 1 }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Search and Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 h-[38px] text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Country */}
        <div className="md:col-span-2">
          <Select
            options={countryOptions}
            value={filters.country ? { value: filters.country, label: filters.country } : null}
            onChange={(opt) => handleChange('country', opt ? opt.value : '')}
            isClearable
            styles={filterSelectStyles}
            placeholder="All Countries"
          />
        </div>

        {/* Department */}
        <div className="md:col-span-2">
          <Select
            options={departmentOptions}
            value={filters.department ? { value: filters.department, label: filters.department } : null}
            onChange={handleDepartmentFilterChange}
            isClearable
            styles={filterSelectStyles}
            placeholder="All Departments"
          />
        </div>

        {/* Designation */}
        <div className="md:col-span-2">
          <Select
            options={designationOptions}
            value={filters.designation ? { value: filters.designation, label: filters.designation } : null}
            onChange={(opt) => handleChange('designation', opt ? opt.value : '')}
            isClearable
            styles={filterSelectStyles}
            placeholder="All Designations"
          />
        </div>

        {/* Currency */}
        <div className="md:col-span-2">
          <Select
            options={currencyOptions}
            value={filters.currency ? { value: filters.currency, label: filters.currency } : null}
            onChange={(opt) => handleChange('currency', opt ? opt.value : '')}
            isClearable
            styles={filterSelectStyles}
            placeholder="All Currencies"
          />
        </div>
      </div>

      {/* Second Row: Salary Range & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Net Salary Range:</span>
          <input
            type="number"
            placeholder="Min"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="w-24 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
          <span className="text-slate-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="w-24 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </span>

              {/* Reset Filters button: ONLY rendered when activeFiltersCount > 0 */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
