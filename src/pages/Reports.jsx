import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileSpreadsheet, Download, Filter, Printer, CheckCircle2, FileText, Globe } from 'lucide-react';

export default function Reports() {
  const [filterOptions, setFilterOptions] = useState({ countries: [], departments: [], designations: [], currencies: [] });
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [previewRecords, setPreviewRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getFilterOptions()
      .then(res => setFilterOptions(res.data || {}))
      .catch(err => console.error('Failed to load filter options:', err));
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await api.getSalaries({
        country: selectedCountry,
        department: selectedDepartment,
        currency: selectedCurrency,
        minSalary,
        maxSalary,
        limit: 10,
        page: 1
      });
      setPreviewRecords(res.data || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [selectedCountry, selectedDepartment, selectedCurrency, minSalary, maxSalary]);

  const handleExportCsv = () => {
    const exportUrl = api.getExportUrl({
      country: selectedCountry,
      department: selectedDepartment,
      currency: selectedCurrency,
      minSalary,
      maxSalary
    });
    window.location.href = exportUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compensation Reports & Export</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate customized salary summaries and export audit-ready CSV reports for payroll and finance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({totalCount.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Report Scope & Filters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">All Countries</option>
              {filterOptions.countries?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">All Departments</option>
              {filterOptions.departments?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-indigo-700"
            >
              <option value="">All Currencies</option>
              {filterOptions.currencies?.map(curr => <option key={curr} value={curr}>{curr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Net Salary</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Net Salary</label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Scope Summary Highlight */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Selected Dataset Scope
          </span>
          <h3 className="text-xl font-extrabold mt-0.5">
            {totalCount.toLocaleString()} Employee Records Matched
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Filtered by {selectedCountry || 'All Countries'} • {selectedDepartment || 'All Departments'} • {selectedCurrency || 'All Currencies'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download CSV Report</span>
        </button>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sample Report Preview (First 10 records)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Full export includes all {totalCount.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-white border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2.5 px-4">#ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Country</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4 text-right">Basic</th>
                <th className="py-2.5 px-4 text-right">Allowances</th>
                <th className="py-2.5 px-4 text-right">Deductions</th>
                <th className="py-2.5 px-4 text-right font-extrabold text-indigo-700">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading preview...
                  </td>
                </tr>
              ) : previewRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No matching records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                previewRecords.map((emp) => {
                  const sal = emp.salary || {};
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-400">#{emp.id}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-2.5 px-4">{emp.country}</td>
                      <td className="py-2.5 px-4">{emp.department}</td>
                      <td className="py-2.5 px-4">{emp.designation}</td>
                      <td className="py-2.5 px-4 text-right font-medium">
                        {emp.currency} {Number(sal.basicSalary || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-600 font-medium">
                        +{emp.currency} {Number(sal.allowances || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right text-red-500 font-medium">
                        -{emp.currency} {Number(sal.deductions || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-indigo-700">
                        {emp.currency} {Number(sal.netSalary || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
