/**
 * API Client for Salary Management System
 * Uses native fetch with robust error handling.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Salary Records CRUD
  async getSalaries(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/salaries?${query.toString()}`);
  },

  async getSalaryById(id) {
    return request(`/salaries/${id}`);
  },

  async createSalary(payload) {
    return request('/salaries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSalary(id, payload) {
    return request(`/salaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteSalary(id) {
    return request(`/salaries/${id}`, {
      method: 'DELETE',
    });
  },

  async getFilterOptions() {
    return request('/salaries/filters');
  },

  // Analytics
  async getAnalyticsSummary() {
    return request('/analytics/summary');
  },

  async getAnalyticsByCountry() {
    return request('/analytics/by-country');
  },

  async getAnalyticsByDepartment() {
    return request('/analytics/by-department');
  },

  async getAnalyticsByDesignation() {
    return request('/analytics/by-designation');
  },

  // CSV Export URL builder
  getExportUrl(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return `${BASE_URL}/reports/export?${query.toString()}`;
  },
};
