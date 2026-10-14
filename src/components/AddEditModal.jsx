import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertCircle, Save, UserPlus, DollarSign } from 'lucide-react';
import Select from 'react-select';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.5rem',
    minHeight: '38px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
    fontSize: '0.875rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
    color: state.isSelected ? 'white' : '#0f172a',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '500',
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

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'JPY', label: 'JPY (¥)' }
];

export default function AddEditModal({ isOpen, onClose, onSave, employee = null, filterOptions = {} }) {
  const isEdit = Boolean(employee);

  const initialForm = {
    name: '',
    email: '',
    country: '',
    department: '',
    designation: '',
    currency: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill when editing, or keep blank when adding
  useEffect(() => {
    if (employee) {
      const sal = employee.salary || {};
      setForm({
        name: employee.name || '',
        email: employee.email || '',
        country: employee.country || '',
        department: employee.department || '',
        designation: employee.designation || '',
        currency: employee.currency || '',
        basicSalary: sal.basicSalary !== undefined ? String(sal.basicSalary) : '',
        allowances: sal.allowances !== undefined ? String(sal.allowances) : '',
        deductions: sal.deductions !== undefined ? String(sal.deductions) : '',
        effectiveFrom: sal.effectiveFrom || new Date().toISOString().split('T')[0]
      });
    } else {
      setForm({
        name: '',
        email: '',
        country: '',
        department: '',
        designation: '',
        currency: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
        effectiveFrom: new Date().toISOString().split('T')[0]
      });
    }
    setError('');
  }, [employee, isOpen]);

  // Real-time Gross and Net Calculation
  const basic = parseFloat(form.basicSalary) || 0;
  const allow = parseFloat(form.allowances) || 0;
  const deduct = parseFloat(form.deductions) || 0;
  const gross = Math.max(0, basic + allow);
  const net = gross - deduct;
  const isNetNegative = net < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Employee name is required');
    if (!form.email.trim()) return setError('Employee email is required');
    if (!form.country) return setError('Please select a country');
    if (!form.currency) return setError('Please select a currency');
    if (!form.department) return setError('Please select a department');
    if (!form.designation) return setError('Please select a designation');
    if (!form.basicSalary || basic <= 0) return setError('Basic salary must be greater than zero');
    if (isNetNegative) return setError('Deductions cannot exceed Gross Salary (Net Salary cannot be negative)');

    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save salary record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              {isEdit ? <Calculator className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Employee & Salary Details` : 'Add Employee & Salary Record'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update compensation structure and salary details' : 'Create new employee profile and define compensation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter Full Name"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter Email Address"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <Select
                options={(filterOptions.countries?.length > 0 ? filterOptions.countries : ['United States', 'United Kingdom', 'Germany', 'India', 'Singapore', 'Japan']).map(c => ({ value: c, label: c }))}
                value={form.country ? { value: form.country, label: form.country } : null}
                onChange={(opt) => setForm({ ...form, country: opt ? opt.value : '' })}
                styles={selectStyles}
                placeholder="Select Country"
                isClearable
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <Select
                options={CURRENCY_OPTIONS}
                value={form.currency ? CURRENCY_OPTIONS.find(c => c.value === form.currency) || { value: form.currency, label: form.currency } : null}
                onChange={(opt) => setForm({ ...form, currency: opt ? opt.value : '' })}
                styles={selectStyles}
                placeholder="Select Currency"
                isClearable
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <Select
                options={(filterOptions.departments || []).map(d => ({ value: d, label: d }))}
                value={form.department ? { value: form.department, label: form.department } : null}
                onChange={(opt) => setForm({ ...form, department: opt ? opt.value : '' })}
                styles={selectStyles}
                placeholder="Select Department"
                isClearable
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <Select
                options={(filterOptions.designations || []).map(des => ({ value: des, label: des }))}
                value={form.designation ? { value: form.designation, label: form.designation } : null}
                onChange={(opt) => setForm({ ...form, designation: opt ? opt.value : '' })}
                styles={selectStyles}
                placeholder="Select Designation"
                isClearable
              />
            </div>
          </div>

          {/* Salary Breakdown Inputs */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              <span>Compensation Components</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.basicSalary}
                  onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                  placeholder="Enter Basic Salary"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Allowances</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Deductions</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.deductions}
                  onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Live Real-time Calculation Preview Card */}
          <div className="bg-linear-to-r from-indigo-50 to-slate-50 p-3.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-500 font-medium">Gross Salary (Basic + Allowances):</p>
              <p className="text-base font-bold text-slate-900">
                {form.currency ? `${form.currency} ` : ''}{gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Estimated Net Salary (Gross - Deductions):</p>
              <p className={`text-base font-extrabold ${isNetNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                {form.currency ? `${form.currency} ` : ''}{net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isNetNegative}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
