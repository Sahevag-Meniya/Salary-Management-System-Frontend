import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../services/api.js';

describe('Frontend API Client Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch salary structures with correct serialized query parameters', async () => {
    const mockResponse = {
      success: true,
      data: [{ id: 101, name: 'John Doe', netSalary: 55000 }],
      pagination: { total: 1, totalPages: 1, page: 1, limit: 25 },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const params = {
      page: 2,
      limit: 50,
      search: 'John',
      country: 'India',
      department: 'Engineering',
      currency: 'INR',
      minSalary: 30000,
      maxSalary: 80000,
    };

    const result = await api.getSalaryStructures(params);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = globalThis.fetch.mock.calls[0][0];

    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=50');
    expect(calledUrl).toContain('search=John');
    expect(calledUrl).toContain('country=India');
    expect(calledUrl).toContain('department=Engineering');
    expect(calledUrl).toContain('currency=INR');
    expect(calledUrl).toContain('minSalary=30000');
    expect(calledUrl).toContain('maxSalary=80000');
    expect(result).toEqual(mockResponse);
  });

  it('should fetch a single salary structure by ID', async () => {
    const mockEmployee = { success: true, data: { id: 1001, name: 'Alice Smith' } };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEmployee,
    });

    const res = await api.getSalaryStructureById(1001);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][0]).toMatch(/\/structures\/1001$/);
    expect(res).toEqual(mockEmployee);
  });

  it('should send a POST request with payload when creating salary structure', async () => {
    const newPayload = {
      name: 'Bob Martin',
      email: 'bob@example.com',
      basicSalary: 60000,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 200, ...newPayload } }),
    });

    const res = await api.createSalaryStructure(newPayload);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = globalThis.fetch.mock.calls[0];

    expect(url).toMatch(/\/structures$/);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual(newPayload);
    expect(res.success).toBe(true);
  });

  it('should send a PUT request with updated data when editing salary structure', async () => {
    const updatePayload = { basicSalary: 65000, allowances: 20000 };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 200, ...updatePayload } }),
    });

    const res = await api.updateSalaryStructure(200, updatePayload);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = globalThis.fetch.mock.calls[0];

    expect(url).toMatch(/\/structures\/200$/);
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual(updatePayload);
    expect(res.success).toBe(true);
  });

  it('should send a DELETE request when deleting salary structure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Deleted successfully' }),
    });

    const res = await api.deleteSalaryStructure(200);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = globalThis.fetch.mock.calls[0];

    expect(url).toMatch(/\/structures\/200$/);
    expect(options.method).toBe('DELETE');
    expect(res.success).toBe(true);
  });

  it('should construct accurate export CSV URL with query parameters', () => {
    const exportUrl = api.getExportUrl({ country: 'India', search: 'Priya' });

    expect(exportUrl).toContain('/reports/export?');
    expect(exportUrl).toContain('country=India');
    expect(exportUrl).toContain('search=Priya');
  });

  it('should throw descriptive Error when server returns 400 or 500 error status', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, message: 'Basic salary must be a positive number' }),
    });

    await expect(api.createSalaryStructure({ basicSalary: -500 })).rejects.toThrow(
      'Basic salary must be a positive number'
    );
  });
});
