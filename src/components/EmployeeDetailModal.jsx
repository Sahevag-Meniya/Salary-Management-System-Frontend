import React from 'react';
import { X, Building2, Globe, Mail, Briefcase, Calendar, ShieldCheck, DollarSign } from 'lucide-react';

export default function EmployeeDetailModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  const sal = employee.salary || {};
  const basic = parseFloat(sal.basicSalary) || 0;
  const allow = parseFloat(sal.allowances) || 0;
  const gross = parseFloat(sal.grossSalary) || basic + allow;
  const deduct = parseFloat(sal.deductions) || 0;
  const net = parseFloat(sal.netSalary) || gross - deduct;
  const currency = employee.currency || sal.currency || 'USD';
  const deductionPct = gross > 0 ? ((deduct / gross) * 100).toFixed(1) : '0';

  const formatCurrency = (val) => {
    return `${currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-lg">
              {employee.name?.charAt(0) || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{employee.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-medium">
                  ID #{employee.id}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                <span>{employee.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{employee.country}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">{employee.designation}</span>
            </div>
          </div>
        </div>

        {/* Salary Statement Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Compensation Breakdown
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Effective: {sal.effectiveFrom || '2026-01-01'}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            {/* Basic Salary */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-600 font-medium">Basic Salary</span>
              <span className="font-semibold text-slate-900">{formatCurrency(basic)}</span>
            </div>

            {/* Allowances */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-600 font-medium">Allowances (Housing & Travel)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(allow)}</span>
            </div>

            {/* Gross Salary */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
              <span className="text-indigo-900 font-semibold">Gross Salary</span>
              <span className="font-bold text-indigo-900">{formatCurrency(gross)}</span>
            </div>

            {/* Deductions */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <div>
                <span className="text-slate-600 font-medium">Statutory Deductions (Tax & Benefits)</span>
                <span className="ml-1.5 text-xs text-slate-400">({deductionPct}% of Gross)</span>
              </div>
              <span className="font-semibold text-red-600">-{formatCurrency(deduct)}</span>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="p-4 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                Net Take-Home Pay
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">
                {formatCurrency(net)}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}
