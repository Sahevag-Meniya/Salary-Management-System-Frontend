import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users, DollarSign, Globe, Building2, TrendingUp,
  Award, ArrowUpRight, ArrowDownRight, RefreshCw, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  const initialCurrency = searchParams.get('currency') || 'INR';
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, countRes, deptRes, desigRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsByCountry(),
        api.getAnalyticsByDepartment(),
        api.getAnalyticsByDesignation(),
      ]);

      setSummary(sumRes.data);
      setCountries(countRes.data || []);
      setDepartments(deptRes.data || []);
      setDesignations(desigRes.data || []);

      const availableCurrencies = sumRes.data?.currencyBreakdown?.map((c) => c.currency) || [];
      const currentParam = searchParams.get('currency');

      if (currentParam && availableCurrencies.includes(currentParam)) {
        setSelectedCurrency(currentParam);
      } else if (availableCurrencies.length > 0) {
        const defaultCurr = availableCurrencies.includes(selectedCurrency) ? selectedCurrency : availableCurrencies[0];
        setSelectedCurrency(defaultCurr);
        setSearchParams({ currency: defaultCurr }, { replace: true });
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
    }
  }, [searchParams]);

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    setSearchParams({ currency: curr }, { replace: true });
  };

  const currentCurrencyData = summary?.currencyBreakdown?.find(
    (c) => c.currency === selectedCurrency
  ) || {};

  // Filter country & department chart data for selected currency
  const filteredCountries = countries.filter((c) => c.currency === selectedCurrency);
  const filteredDepartments = departments.filter((d) => d.currency === selectedCurrency);
  const filteredDesignations = designations.filter((d) => d.currency === selectedCurrency);

  const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading compensation intelligence...</p>
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-end pb-2 border-b border-slate-200">
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === item.currency
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
        {/* Country Headcount & Spend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Country-wise Payroll Distribution</h3>
              <p className="text-xs text-slate-500">Total Net Spend in {selectedCurrency}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              {filteredCountries.length} Region{filteredCountries.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCountries} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`${selectedCurrency} ${Number(value).toLocaleString()}`, 'Total Net Pay']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalNet" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Total Payroll" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Salary Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Compensation Breakdown</h3>
              <p className="text-xs text-slate-500">Department wise net salary in {selectedCurrency}</p>
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

      {/* Role / Designation Salary Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Salary Comparison by Role & Seniority</h3>
            <p className="text-xs text-slate-500">Average vs highest take-home pay for each role in {selectedCurrency}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 font-semibold border border-violet-100">
            Role Comparison
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredDesignations} margin={{ top: 15, right: 20, left: 20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="designation" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value, name) => [`${selectedCurrency} ${Number(value).toLocaleString()}`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="avgNet" fill="#6366f1" radius={[4, 4, 0, 0]} name="Average Net Pay" />
              <Bar dataKey="maxNet" fill="#a855f7" radius={[4, 4, 0, 0]} name="Highest Net Pay" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
