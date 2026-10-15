import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users, DollarSign, Globe, Building2, TrendingUp,
  Award, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, Trophy
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [topEarners, setTopEarners] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const initialCurrency = searchParams.get('currency') || 'INR';
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopEarners = async (curr) => {
    if (!curr) return;
    try {
      const earnersRes = await api.getAnalyticsTopEarners(curr);
      setTopEarners(earnersRes.data || []);
    } catch (err) {
      console.error('Failed to load top earners:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, earnersRes, deptRes, desigRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsTopEarners(initialCurrency),
        api.getAnalyticsByDepartment(),
        api.getAnalyticsByDesignation(),
      ]);

      setSummary(sumRes.data);
      setTopEarners(earnersRes.data || []);
      setDepartments(deptRes.data || []);
      setDesignations(desigRes.data || []);

      const availableCurrencies = sumRes.data?.currencyBreakdown?.map((c) => c.currency) || [];
      const currentParam = searchParams.get('currency');

      let targetCurr = selectedCurrency;
      if (currentParam && availableCurrencies.includes(currentParam)) {
        targetCurr = currentParam;
        setSelectedCurrency(currentParam);
      } else if (availableCurrencies.length > 0) {
        targetCurr = availableCurrencies.includes(selectedCurrency) ? selectedCurrency : availableCurrencies[0];
        setSelectedCurrency(targetCurr);
        setSearchParams({ currency: targetCurr }, { replace: true });
      }

      if (targetCurr !== initialCurrency) {
        fetchTopEarners(targetCurr);
      }
    } catch (err) {
      setError(err.message || 'Failed to load executive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync state if URL searchParams currency changes externally (back/forward)
  useEffect(() => {
    const currFromUrl = searchParams.get('currency');
    if (currFromUrl && currFromUrl !== selectedCurrency) {
      setSelectedCurrency(currFromUrl);
      fetchTopEarners(currFromUrl);
    }
  }, [searchParams]);

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    setSearchParams({ currency: curr }, { replace: true });
    fetchTopEarners(curr);
  };

  const currentCurrencyData = summary?.currencyBreakdown?.find(
    (c) => c.currency === selectedCurrency
  ) || {};

  // Filter department, designation & top earners chart data for selected currency
  const filteredTopEarners = topEarners.filter((e) => e.currency === selectedCurrency);
  const filteredDepartments = departments.filter((d) => d.currency === selectedCurrency);
  const filteredDesignations = designations.filter((d) => d.currency === selectedCurrency);

  const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Fetching Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <p className="text-sm text-red-700 font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3">
      {/* Page Header (Fixed at top) */}
      <div className="shrink-0 flex items-center justify-end pb-2 border-b border-slate-200">
        {/* Currency Selector (Strict Currency Isolation) */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-indigo-600" /> Currency :
          </span>
          <div className="flex flex-wrap gap-1">
            {summary?.currencyBreakdown?.map((item) => (
              <button
                key={item.currency}
                onClick={() => handleCurrencyChange(item.currency)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedCurrency === item.currency
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {item.currency}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Dashboard Body (Below Currency Filter) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-6 pr-1.5 pb-2">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={summary?.totalEmployees ? summary.totalEmployees.toLocaleString() : '10,000'}
          subtitle="Active employees worldwide"
          icon={Users}
          color="indigo"
        />

        <StatCard
          title={`Total Payroll (${selectedCurrency})`}
          value={`${selectedCurrency} ${(currentCurrencyData.totalNet || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtitle={`For ${(currentCurrencyData.employeeCount || 0).toLocaleString()} employees`}
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title={`Average Pay (${selectedCurrency})`}
          value={`${selectedCurrency} ${(currentCurrencyData.avgNet || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtitle="Mean net take-home salary"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title={`Max Salary (${selectedCurrency})`}
          value={`${selectedCurrency} ${(currentCurrencyData.maxNet || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtitle={`Min Salary : ${selectedCurrency} ${(currentCurrencyData.minNet || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={Award}
          color="violet"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Highest Paid Employees */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top 5 Highest Paid Employees</h3>
              <p className="text-xs text-slate-500">Highest take-home compensation in {selectedCurrency}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> Top Earners
            </span>
          </div>

          <div className="h-72 flex flex-col justify-between">
            {filteredTopEarners.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <Users className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                No records found for {selectedCurrency}
              </div>
            ) : (
              filteredTopEarners.map((emp, idx) => {
                const maxNet = filteredTopEarners[0]?.netSalary || 1;
                const percent = Math.min(100, Math.max(12, Math.round((emp.netSalary / maxNet) * 100)));
                const initials = emp.name
                  ? emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'EM';

                const rankBadges = [
                  'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xs font-black ring-2 ring-amber-100',
                  'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-xs font-bold ring-2 ring-slate-100',
                  'bg-gradient-to-br from-amber-700 to-amber-800 text-white shadow-xs font-bold ring-2 ring-amber-100',
                  'bg-slate-100 text-slate-600 font-semibold border border-slate-200',
                  'bg-slate-100 text-slate-600 font-semibold border border-slate-200'
                ];

                return (
                  <div
                    key={emp.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Indicator */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] shrink-0 ${rankBadges[idx] || rankBadges[3]}`}>
                        #{idx + 1}
                      </div>

                      {/* Initials Avatar */}
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>

                      {/* Employee Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {emp.name}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium shrink-0 border border-slate-200">
                            {emp.department}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
                      </div>
                    </div>

                    {/* Salary & Relative Progress */}
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-bold text-slate-900">
                        {selectedCurrency} {Number(emp.netSalary).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Department-wise Salary Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Compensation Breakdown</h3>
              <p className="text-xs text-slate-500">Department wise total paid net salary in {selectedCurrency}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              By Department
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDepartments} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip
                  formatter={(value) => [`${selectedCurrency} ${Number(value).toLocaleString()}`, 'Total Net Pay']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalNet" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Department Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Role Breakdown & Comparison Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role-wise Average Salary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Role-wise Average Salary</h3>
              <p className="text-xs text-slate-500">Average take-home pay for each role in {selectedCurrency}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              Role Average
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDesignations} margin={{ top: 15, right: 20, left: 20, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="designation" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`${selectedCurrency} ${Number(value).toLocaleString()}`, 'Average Net Pay']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="avgNet" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Average Net Pay" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Comparison by Role & Seniority (Min vs Max) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Salary Comparison by Role</h3>
              <p className="text-xs text-slate-500">Minimum vs maximum take-home pay for each role in {selectedCurrency}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 font-semibold border border-violet-100">
              Min vs Max Range
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDesignations} margin={{ top: 15, right: 20, left: 20, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="designation" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`${selectedCurrency} ${Number(value).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="minNet" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Minimum Net Pay" />
                <Bar dataKey="maxNet" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Maximum Net Pay" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
