import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FilterBar from '../components/FilterBar';

describe('FilterBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultFilters = {
    search: '',
    country: '',
    department: '',
    designation: '',
    currency: '',
    minSalary: '',
    maxSalary: '',
    page: 1,
    limit: 25,
  };

  const sampleOptions = {
    countries: ['India', 'United States'],
    departments: ['Engineering', 'Product'],
    designations: ['Software Engineer', 'Product Manager'],
    currencies: ['INR', 'USD'],
  };

  it('should render search input and filter placeholders', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        setFilters={vi.fn()}
        filterOptions={sampleOptions}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument();
    expect(screen.getByText('All Countries')).toBeInTheDocument();
    expect(screen.getByText('All Departments')).toBeInTheDocument();
    expect(screen.getByText('All Designations')).toBeInTheDocument();
    expect(screen.getByText('All Currencies')).toBeInTheDocument();
  });

  it('should not display Reset Filters button when no active filters exist', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        setFilters={vi.fn()}
        filterOptions={sampleOptions}
        onReset={vi.fn()}
      />
    );

    expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
  });

  it('should display Reset Filters button and active filter badge when filters are present', () => {
    const activeFilters = {
      ...defaultFilters,
      search: 'Priya',
      country: 'India',
    };

    render(
      <FilterBar
        filters={activeFilters}
        setFilters={vi.fn()}
        filterOptions={sampleOptions}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText('2 active filters')).toBeInTheDocument();
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });

  it('should call onReset when Reset Filters button is clicked', () => {
    const handleReset = vi.fn();
    const activeFilters = {
      ...defaultFilters,
      search: 'Priya',
    };

    render(
      <FilterBar
        filters={activeFilters}
        setFilters={vi.fn()}
        filterOptions={sampleOptions}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByText('Reset Filters');
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('should debounce search updates before updating filter state', () => {
    const handleSetFilters = vi.fn();

    render(
      <FilterBar
        filters={defaultFilters}
        setFilters={handleSetFilters}
        filterOptions={sampleOptions}
        onReset={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'Alex' } });

    // Should not call immediately before timer expires
    expect(handleSetFilters).not.toHaveBeenCalled();

    // Advance 350ms debounce timer
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(handleSetFilters).toHaveBeenCalledTimes(1);
  });
});
