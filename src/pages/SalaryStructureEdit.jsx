import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import {
  ArrowLeft, Save, Briefcase, Calendar, ShieldCheck,
  AlertCircle, RefreshCw, DollarSign, Plus
} from 'lucide-react';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#6366f1' : '#cbd5e1',
    borderRadius: '0.75rem',
    minHeight: '42px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#94a3b8',
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
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontWeight: '500',
  }),
};

const COMMON_REASONS = [
  'Joining Package',
  'Annual Appraisal / Hike',
  'Promotion',
  'Market Correction',
  'Role Reclassification',
  'Probation Completion',
  'Cost of Living Adjustment (COLA)'
];

export default function SalaryStructureEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Initial employee data to compare against (for edit mode)
  const [originalEmployee, setOriginalEmployee] = useState(null);

  // Filter options for dropdowns
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    departments: [],
    designations: [],
    currencies: [],
    countryList: [],
    designationList: []
  });

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    department: '',
    designation: '',
    designationId: null,
    currency: 'USD',
    basicSalary: '',
    allowances: '',
    deductions: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    revisionReason: isEdit ? 'Annual Appraisal / Hike' : 'Joining Package'
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isEdit) {
          const [empRes, filtersRes] = await Promise.all([
            api.getSalaryStructureById(id),
            api.getFilterOptions()
          ]);

          if (!isMounted) return;

          const empData = empRes.data || empRes;
          const filters = filtersRes.data || filtersRes;

          setOriginalEmployee(empData);
          setFilterOptions(filters);

          const sal = empData.salary || {};
          const struct = empData.salaryStructure || {};

          setForm({
            name: empData.name || '',
            email: empData.email || '',
            country: empData.country || '',
            department: empData.department || '',
            designation: empData.designation || '',
            designationId: empData.designationId || null,
            currency: sal.currency || struct.currency || empData.currency || 'USD',
            basicSalary: sal.basicSalary !== undefined ? String(sal.basicSalary) : '',
            allowances: sal.allowances !== undefined ? String(sal.allowances) : '',
            deductions: sal.deductions !== undefined ? String(sal.deductions) : '',
            effectiveFrom: sal.effectiveFrom || struct.effectiveFrom || new Date().toISOString().split('T')[0],
            revisionReason: sal.revisionReason || struct.revisionReason || 'Annual Appraisal / Hike'
          });
        } else {
          const filtersRes = await api.getFilterOptions();
          if (!isMounted) return;

          const filters = filtersRes.data || filtersRes;
          setFilterOptions(filters);

          setForm({
            name: '',
            email: '',
            country: '',
            department: '',
            designation: '',
            designationId: null,
            currency: 'USD',
            basicSalary: '',
            allowances: '',
            deductions: '',
            effectiveFrom: new Date().toISOString().split('T')[0],
            revisionReason: 'Joining Package'
          });
        }
      } catch (err) {
        console.error('Failed to load details:', err);
        if (isMounted) {
          setError(err.message || (isEdit ? `Failed to find employee with ID #${id}` : 'Failed to load options'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  // Real-time calculation helpers
  const basic = Number(form.basicSalary) || 0;
  const allow = Number(form.allowances) || 0;
  const deduct = Number(form.deductions) || 0;
  const gross = basic + allow;
  const net = gross - deduct;
  const isNetNegative = net < 0;
  const deductionPercent = gross > 0 ? ((deduct / gross) * 100).toFixed(1) : 0;

  // Original figures for comparison (edit mode)
  const origSal = originalEmployee?.salary || {};
  const origNet = Number(origSal.netSalary || 0);
  const netDiff = net - origNet;

  // Cascading designations based on selected department
  const availableDesignations = useMemo(() => {
    if (!filterOptions.designationList || filterOptions.designationList.length === 0) {
      return (filterOptions.designations || []).map(d => ({ value: d, label: d }));
    }
    if (form.department) {
      const filtered = filterOptions.designationList.filter(
        d => d.departmentName.toLowerCase() === form.department.toLowerCase()
      );
      if (filtered.length > 0) {
        return filtered.map(d => ({ value: d.name, label: d.name, id: d.id, dept: d.departmentName }));
      }
    }
    return filterOptions.designationList.map(d => ({
      value: d.name,
      label: `${d.name} (${d.departmentName})`,
      id: d.id,
      dept: d.departmentName
    }));
  }, [filterOptions, form.department]);

  const handleCountryChange = (opt) => {
    const newCountryName = opt ? opt.value : '';
    let autoCurrency = form.currency;
    if (filterOptions.countryList) {
      const found = filterOptions.countryList.find(c => c.name === newCountryName);
      if (found && found.currencyCode) {
        autoCurrency = found.currencyCode;
      }
    }
    setForm(prev => ({
      ...prev,
      country: newCountryName,
      currency: autoCurrency
    }));
  };

  const handleDepartmentChange = (opt) => {
    const newDept = opt ? opt.value : '';
    let newDesig = form.designation;
    let newDesigId = form.designationId;

    if (newDept && form.designation && filterOptions.designationList) {
      const stillValid = filterOptions.designationList.some(
        d => d.name === form.designation && d.departmentName.toLowerCase() === newDept.toLowerCase()
      );
      if (!stillValid) {
        newDesig = '';
        newDesigId = null;
      }
    }

    setForm(prev => ({
      ...prev,
      department: newDept,
      designation: newDesig,
      designationId: newDesigId
    }));
  };

  const handleDesignationChange = (opt) => {
    if (!opt) {
      setForm(prev => ({ ...prev, designation: '', designationId: null }));
      return;
    }
    const matched = filterOptions.designationList?.find(d => d.id === opt.id || d.name === opt.value);
    setForm(prev => ({
      ...prev,
      designation: opt.value,
      designationId: opt.id || matched?.id || null,
      department: matched?.departmentName || prev.department
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!form.name.trim()) {
      setValidationError('Employee name is required');
      return;
    }
    if (!form.email.trim()) {
      setValidationError('Employee email is required');
      return;
    }
    if (!form.country) {
      setValidationError('Please select a country');
      return;
    }
    if (!form.department) {
      setValidationError('Please select a department');
      return;
    }
    if (!form.designation) {
      setValidationError('Please select a designation');
      return;
    }
    if (!form.basicSalary || basic <= 0) {
      setValidationError('Basic salary must be greater than zero');
      return;
    }
    if (isNetNegative) {
      setValidationError('Deductions cannot exceed Gross Salary (Net Pay cannot be negative)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        country: form.country,
        department: form.department,
        designation: form.designation,
        designationId: form.designationId,
        currency: form.currency,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        effectiveFrom: form.effectiveFrom || new Date().toISOString().split('T')[0],
        revisionReason: form.revisionReason ? form.revisionReason.trim() : (isEdit ? 'Updated Structure' : 'Joining Package')
      };

      if (isEdit) {
        await api.updateSalaryStructure(id, payload);

        await Swal.fire({
          icon: 'success',
          title: 'Salary Structure Updated!',
          text: `Salary package for ${form.name} was successfully updated.`,
          timer: 1800,
          showConfirmButton: false
        });

        navigate(`/structures/${id}`);
      } else {
        const res = await api.createSalaryStructure(payload);
        const newEmp = res.data || res;

        await Swal.fire({
          icon: 'success',
          title: 'Salary Structure Created!',
          text: `Salary structure for ${form.name} was successfully created.`,
          timer: 1800,
          showConfirmButton: false
        });

        navigate(newEmp.id ? `/structures/${newEmp.id}` : '/structures');
      }
    } catch (err) {
      console.error('Operation failed:', err);
      setValidationError(err.message || 'Failed to process salary structure. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (val) => {
    return Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          {isEdit ? 'Loading Salary Structure for editing...' : 'Preparing Salary Structure form...'}
        </p>
      </div>
    );
  }

  if (error || (isEdit && !originalEmployee)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Salary Structure Not Found' : 'Failed to Load Form'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {error || `Unable to load details.`}
          </p>
        </div>
        <button
          onClick={() => navigate('/structures')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salary Structures</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4 pb-1 max-w-6xl mx-auto w-full">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${
            isEdit ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            {isEdit ? `#${originalEmployee.id}` : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isEdit ? 'Edit Salary Structure' : 'Add New Salary Structure'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isEdit ? (
                <>Updating compensation package for <span className="font-bold text-slate-700">{originalEmployee.name}</span></>
              ) : (
                'Configure employee designation, compensation structure, and withholding rules'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/structures/${id}` : '/structures')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            form="edit-salary-structure-form"
            disabled={saving || isNetNegative}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Structure' : 'Create Structure'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Calculator */}
      <form id="edit-salary-structure-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Form Sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Employee Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Employee Context
                </h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Department & Role Allocation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john.doe@company.com"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Country Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.country ? { value: form.country, label: form.country } : null}
                  onChange={handleCountryChange}
                  options={(filterOptions.countries || []).map(c => ({ value: c, label: c }))}
                  styles={selectStyles}
                  placeholder="Select Country..."
                  isClearable
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.department ? { value: form.department, label: form.department } : null}
                  onChange={handleDepartmentChange}
                  options={(filterOptions.departments || []).map(d => ({ value: d, label: d }))}
                  styles={selectStyles}
                  placeholder="Select Department..."
                  isClearable
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Designation / Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.designation ? { value: form.designation, label: form.designation } : null}
                  onChange={handleDesignationChange}
                  options={availableDesignations}
                  styles={selectStyles}
                  placeholder={form.department ? `Select Role in ${form.department}...` : "Select Designation..."}
                  isClearable
                />
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Compensation Package Breakdown
                </h2>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Currency: {form.currency}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Basic Pay <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.basicSalary}
                    onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-10 pl-3 pr-8 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                    {form.currency}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Core contractual wage</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Allowances
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.allowances}
                    onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-10 pl-3 pr-8 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                    {form.currency}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">HRA, Conveyance, Special</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Deductions
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-10 pl-3 pr-8 bg-white border border-slate-300 rounded-xl text-xs font-bold text-red-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">
                    {form.currency}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">PF, TDS, Taxes & Insurance</p>
              </div>
            </div>
          </div>

          {/* Section 3: Revision History & Effective Date */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isEdit ? 'Revision Reason & Effective Date' : 'Joining Details & Effective Date'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Effective From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isEdit ? 'Revision Reason / Audit Tag' : 'Structure Type / Note'}
                </label>
                <input
                  type="text"
                  list="reasons-list"
                  value={form.revisionReason}
                  onChange={(e) => setForm({ ...form, revisionReason: e.target.value })}
                  placeholder="e.g. Joining Package"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <datalist id="reasons-list">
                  {COMMON_REASONS.map((reason, idx) => (
                    <option key={idx} value={reason} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Calculation Preview */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Calculation Preview
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-computed
              </span>
            </div>

            {/* Calculated Gross */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Calculated Gross Pay</span>
                <span className="text-[11px] font-bold text-slate-700">Monthly</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {form.currency} {formatNumber(gross)}
              </div>
              <div className="text-[11px] text-slate-400">
                Basic ({formatNumber(basic)}) + Allowances ({formatNumber(allow)})
              </div>
            </div>

            {/* Calculated Deductions */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Deductions</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  {deductionPercent}% of Gross
                </span>
              </div>
              <div className="text-xl font-black text-red-600">
                -{form.currency} {formatNumber(deduct)}
              </div>
            </div>

            {/* Net In-Hand Salary Callout */}
            <div className={`p-4 rounded-xl border space-y-1.5 ${
              isNetNegative
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-linear-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-100'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold opacity-90">
                <span>Net Take-Home Pay</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">Monthly Credit</span>
              </div>
              <div className="text-2xl font-black tracking-tight">
                {form.currency} {formatNumber(net)}
              </div>
              <p className="text-[11px] opacity-80">
                {isNetNegative
                  ? '⚠️ Invalid: Deductions exceed Gross Salary!'
                  : 'Gross Pay - Total Deductions'}
              </p>
            </div>

            {/* Comparison vs Original Structure (Edit mode) OR Package Distribution (Add mode) */}
            {isEdit ? (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Impact vs Current Structure
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Previous Net Pay:</span>
                  <span className="font-bold text-slate-800">
                    {form.currency} {formatNumber(origNet)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">New Net Pay:</span>
                  <span className="font-bold text-slate-800">
                    {form.currency} {formatNumber(net)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Net Variance:</span>
                  <span className={`px-2 py-0.5 rounded-sm text-xs font-mono font-bold ${
                    netDiff > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : netDiff < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-200 text-slate-700'
                  }`}>
                    {netDiff > 0 ? `+${formatNumber(netDiff)}` : formatNumber(netDiff)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Package Distribution Breakdown
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Basic Share:</span>
                  <span className="font-bold text-slate-800">
                    {gross > 0 ? `${((basic / gross) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Allowances Share:</span>
                  <span className="font-bold text-slate-800">
                    {gross > 0 ? `${((allow / gross) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Net Take-Home Ratio:</span>
                  <span className="font-bold text-indigo-700">
                    {gross > 0 ? `${((net / gross) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            )}

            {/* Annual CTC Projection */}
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Annualized CTC:</span>
                <span className="font-extrabold text-slate-900">
                  {form.currency} {formatNumber(gross * 12)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Annual Net Credit:</span>
                <span className="font-extrabold text-indigo-700">
                  {form.currency} {formatNumber(net * 12)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
