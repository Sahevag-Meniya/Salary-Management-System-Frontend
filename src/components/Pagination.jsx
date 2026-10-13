import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Select from 'react-select';

const limitSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.5rem',
    minHeight: '32px',
    height: '32px',
    width: '76px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
    fontSize: '0.75rem',
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 6px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.75rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '4px 8px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    border: '1px solid #e2e8f0',
    width: '76px',
    minWidth: '76px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '2px',
    color: '#94a3b8',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const limitOptions = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

export default function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-xl text-sm">
      {/* Left: Rows Per Page & Record Counts */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">Rows per page:</span>
          <Select
            options={limitOptions}
            value={limitOptions.find(o => o.value === limit)}
            onChange={(opt) => onLimitChange(opt ? opt.value : 25)}
            isSearchable={false}
            styles={limitSelectStyles}
            menuPlacement="top"
          />
        </div>

        <span>
          Showing <strong className="text-slate-800 font-semibold">{startItem}</strong> to{' '}
          <strong className="text-slate-800 font-semibold">{endItem}</strong> of{' '}
          <strong className="text-slate-800 font-semibold">{total.toLocaleString()}</strong> records
        </span>
      </div>

      {/* Right: Page Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-slate-400 text-xs">
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
