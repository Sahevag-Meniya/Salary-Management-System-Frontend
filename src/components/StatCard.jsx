import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      border: 'border-indigo-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-100'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-100'
    },
    violet: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      border: 'border-violet-100'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border`}>
          {Icon && <Icon className={`w-5 h-5 ${scheme.icon}`} />}
        </div>
      </div>
    </div>
  );
}
