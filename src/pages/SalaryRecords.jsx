import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import AddEditModal from '../components/AddEditModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import Swal from 'sweetalert2';
import {
  UserPlus, ArrowUpDown, Eye, Edit2, Trash2,
  RefreshCw, Users, FileDown, AlertCircle
} from 'lucide-react';

export default function SalaryRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering state
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({ countries: [], departments: [], designations: [], currencies: [] });

  const initialFilters = {
    search: '',
    country: '',
    department: '',
    designation: '',
    currency: '',
    minSalary: '',
    maxSalary: '',
    sortBy: 'id',
    sortOrder: 'ASC',
    page: 1,
    limit: 25
  };

  const [filters, setFilters] = useState(initialFilters);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState(null);

  // Fetch filter options once
  useEffect(() => {
    api.getFilterOptions()
      .then(res => setFilterOptions(res.data || {}))
      .catch(err => console.error('Failed to load filter options:', err));
  }, []);

  // Fetch salary records whenever filters change
  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSalaries(filters);
      setRecords(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load employee salary records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
      page: 1
    }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // CRUD Actions
  const handleSaveSalary = async (payload) => {
    if (selectedForEdit) {
      await api.updateSalary(selectedForEdit.id, payload);
      Swal.fire({
        title: 'Updated!',
        text: `Salary record has been updated successfully.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await api.createSalary(payload);
      Swal.fire({
        title: 'Added!',
        text: `Salary record has been added successfully.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });
    }
    await fetchRecords();
  };

  // SweetAlert2 Delete Confirmation
  const handleDeleteSalary = async (emp) => {
    const result = await Swal.fire({
      title: 'Delete Employee Record?',
      html: `This will not be revert.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        await api.deleteSalary(emp.id);
        await fetchRecords();
        Swal.fire({
          title: 'Deleted!',
          text: `Record has been deleted.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message || 'Failed to delete record.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Salary Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage compensation records for {total.toLocaleString()} employees with sub-50ms indexed search.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedForEdit(null);
              setIsAddEditOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee Salary</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onReset={handleResetFilters}
      />

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">#ID</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('country')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Region / Currency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Department & Role</th>
                <th
                  onClick={() => handleSort('basic_salary')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Basic Pay</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th
                  onClick={() => handleSort('net_salary')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center justify-end gap-1.5 text-indigo-700 font-extrabold">
                    <span>Net Take-Home</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                      <p className="text-xs font-medium">Fetching 10,000 employee dataset...</p>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">No employee records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or filters.</p>
                  </td>
                </tr>
              ) : (
                records.map((emp) => {
                  const sal = emp.salary || {};
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-400">#{emp.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-48">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{emp.country}</div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                          {emp.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{emp.department}</div>
                        <div className="text-[11px] text-slate-400">{emp.designation}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {emp.currency} {formatNumber(sal.basicSalary)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                        +{emp.currency} {formatNumber(sal.allowances)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-500 font-medium">
                        -{emp.currency} {formatNumber(sal.deductions)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-sm text-indigo-700">
                          {emp.currency} {formatNumber(sal.netSalary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedForDetail(emp);
                              setIsDetailOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                            title="View Full Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedForEdit(emp);
                              setIsAddEditOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSalary(emp)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination Component */}
        <Pagination
          page={filters.page}
          limit={filters.limit}
          total={total}
          totalPages={totalPages}
          onPageChange={(newPage) => setFilters(prev => ({ ...prev, page: newPage }))}
          onLimitChange={(newLimit) => setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }))}
        />
      </div>

      {/* Modals */}
      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setSelectedForEdit(null);
        }}
        onSave={handleSaveSalary}
        employee={selectedForEdit}
        filterOptions={filterOptions}
      />

      <EmployeeDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedForDetail(null);
        }}
        employee={selectedForDetail}
      />
    </div>
  );
}
