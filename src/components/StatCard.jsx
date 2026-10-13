import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700',
      border: 'border-indigo-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      border: 'border-amber-100'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      border: 'border-blue-100'
    },
    violet: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      badge: 'bg-violet-100 text-violet-700',
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
      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${scheme.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
