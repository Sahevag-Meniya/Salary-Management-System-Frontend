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
  // Salary Structures CRUD
  async getSalaryStructures(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/structures?${query.toString()}`);
  },

  async getSalaryStructureById(id) {
    return request(`/structures/${id}`);
  },

  async createSalaryStructure(payload) {
    return request('/structures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSalaryStructure(id, payload) {
    return request(`/structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteSalaryStructure(id) {
    return request(`/structures/${id}`, {
      method: 'DELETE',
    });
  },

  async getFilterOptions() {
    return request('/structures/filters');
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

  async getAnalyticsTopEarners(limit = 5) {
    return request(`/analytics/top-earners?limit=${limit}`);
  },

  // CSV Export URL builder
  getExportUrl(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          if (val.length > 0) query.append(key, val.join(','));
        } else {
          query.append(key, val);
        }
      }
    });
    return `${BASE_URL}/reports/export?${query.toString()}`;
  },
};
