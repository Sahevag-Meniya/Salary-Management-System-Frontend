import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft, Building2, Globe, Mail, Briefcase, Calendar,
  ShieldCheck, CheckCircle2, AlertCircle, RefreshCw,
  TrendingUp, Percent, DollarSign, FileText, Edit2
} from 'lucide-react';

export default function SalaryStructureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSalaryStructureById(id);
        const empData = res.data || res;
        setEmployee(empData);
      } catch (err) {
        console.error('Failed to load salary structure details:', err);
        setError(err.message || `Failed to find salary structure for Employee #${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

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
        <p className="text-sm font-semibold text-slate-600">Loading Salary Structure Details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Salary Structure Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {error || `Unable to load details for employee ID #${id}. It may have been removed or does not exist.`}
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

  const sal = employee.salary || {};
  const struct = employee.salaryStructure || {};
  const currency = sal.currency || employee.currency || 'USD';
  const currencySymbol = employee.currencySymbol || '';

  const grossSalary = Number(sal.grossSalary || struct.grossSalary || 0);
  const totalDeductions = Number(sal.totalDeductions || struct.totalDeductions || 0);
  const netSalary = Number(sal.netSalary || struct.netSalary || 0);
  const effectiveFrom = sal.effectiveFrom || struct.effectiveFrom || '2026-01-01';
  const revisionReason = sal.revisionReason || struct.revisionReason || 'Joining Package';

  // Group line-item components into earnings and deductions
  const componentsList = sal.components || struct.components || [];
  const earningsList = [];
  const deductionsList = [];

  componentsList.forEach(item => {
    const comp = item.component || {};
    const parsedItem = {
      id: item.id,
      code: comp.code || '',
      name: comp.name || item.name || 'Component',
      type: comp.type || 'earning',
      calculationType: comp.calculationType || 'fixed',
      defaultValue: comp.defaultValue || '0',
      amount: Number(item.amount || 0)
    };

    if (parsedItem.type === 'deduction') {
      deductionsList.push(parsedItem);
    } else {
      earningsList.push(parsedItem);
    }
  });

  const deductionPercent = grossSalary > 0 ? ((totalDeductions / grossSalary) * 100).toFixed(1) : 0;

  return (
    <div className="flex-1 flex flex-col space-y-4 pb-1 max-w-6xl mx-auto w-full">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          onClick={() => navigate(`/structures/${employee.id}/edit`)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Edit Structure</span>
        </button>

        <button
          onClick={() => navigate('/structures')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Salary Structures</span>
        </button>
      </div>

      {/* Employee Profile Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-indigo-50/70 via-violet-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-indigo-100 shrink-0">
              {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{employee.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  ID #{employee.id}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active Structure</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{employee.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{employee.department || 'General'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{employee.designation || 'Staff'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{employee.country} ({currency})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Net In-Hand</span>
            <div className="text-3xl font-black text-indigo-700 tracking-tight">
              {currencySymbol} {formatNumber(netSalary)}
            </div>
            <span className="text-xs text-slate-400 font-medium">Currency: {currency}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Salary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Gross Pay</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {currencySymbol} {formatNumber(grossSalary)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Base + All Earnings / Month</p>
        </div>

        {/* Total Deductions */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Deductions</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-50 text-red-700 border border-red-200">
              {deductionPercent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            -{currencySymbol} {formatNumber(totalDeductions)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Statutory & Tax Withholdings</p>
        </div>

        {/* Net Salary Take-Home */}
        <div className="bg-linear-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-900 text-xs font-bold">
            <span>Net Take-Home Pay</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">
            {currencySymbol} {formatNumber(netSalary)}
          </div>
          <p className="text-[11px] text-indigo-700/80 mt-1 font-medium">Actual Monthly Bank Credit</p>
        </div>

        {/* Revision Context */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Effective Since</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-2 truncate">
            {effectiveFrom}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate" title={revisionReason}>
            Reason: <span className="font-semibold text-slate-700">{revisionReason}</span>
          </p>
        </div>
      </div>

      {/* Two-Column Itemized Component Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Earnings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monthly Earnings & Allowances
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {earningsList.length} Components
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-2.5 px-4">Component</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earningsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No earning components configured.
                    </td>
                  </tr>
                ) : (
                  earningsList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.calculationType === 'percentage'
                          ? `${Number(item.defaultValue || 0)}% of Basic`
                          : item.calculationType === 'remaining'
                            ? 'Balancing'
                            : 'Fixed'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        +{currencySymbol} {formatNumber(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Gross Earnings Subtotal:</span>
            <span className="text-sm font-extrabold text-slate-900">
              {currencySymbol} {formatNumber(grossSalary)}
            </span>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-red-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monthly Deductions & Withholdings
              </h2>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-100/70 px-2 py-0.5 rounded-full">
              {deductionsList.length} Components
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-2.5 px-4">Component</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deductionsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No deduction components configured.
                    </td>
                  </tr>
                ) : (
                  deductionsList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.calculationType === 'percentage'
                          ? `${Number(item.defaultValue || 0)}% of Basic`
                          : item.calculationType === 'remaining'
                            ? 'Balancing'
                            : 'Fixed'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-red-500">
                        -{currencySymbol} {formatNumber(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Total Deductions Subtotal:</span>
            <span className="text-sm font-extrabold text-red-600">
              -{currencySymbol} {formatNumber(totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Salary Formula Callout Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Net Salary Formula</div>
            <div className="text-sm text-slate-300 mt-0.5">
              Gross Earnings ({currencySymbol} {formatNumber(grossSalary)}) − Total Deductions ({currencySymbol} {formatNumber(totalDeductions)})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xl font-black text-emerald-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span>Net: {currencySymbol} {formatNumber(netSalary)}</span>
        </div>
      </div>

      {/* Annual Projection Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Annualized Compensation Projection (12 Months)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Annual Gross Package</span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {currencySymbol} {formatNumber(grossSalary * 12)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Annual Projected Deductions</span>
            <div className="text-lg font-bold text-red-600 mt-1">
              -{currencySymbol} {formatNumber(totalDeductions * 12)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-xs text-indigo-900 font-bold">Annual In-Hand Projection</span>
            <div className="text-lg font-black text-indigo-700 mt-1">
              {currencySymbol} {formatNumber(netSalary * 12)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
