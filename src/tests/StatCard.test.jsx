import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';

describe('StatCard Component', () => {
  it('should render title and value correctly', () => {
    render(
      <StatCard
        title="Total Payroll"
        value="$1,245,000"
      />
    );

    expect(screen.getByText('Total Payroll')).toBeInTheDocument();
    expect(screen.getByText('$1,245,000')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <StatCard
        title="Active Employees"
        value="10,000"
        subtitle="Across 5 countries"
      />
    );

    expect(screen.getByText('Across 5 countries')).toBeInTheDocument();
  });

  it('should render Icon when passed', () => {
    const { container } = render(
      <StatCard
        title="Net Pay"
        value="$850,000"
        icon={DollarSign}
        color="emerald"
      />
    );

    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass('text-emerald-600');
  });

  it('should fallback to indigo color scheme when invalid or default color is provided', () => {
    const { container } = render(
      <StatCard
        title="Default Card"
        value="123"
        icon={DollarSign}
      />
    );

    const iconContainer = container.querySelector('.bg-indigo-50');
    expect(iconContainer).toBeInTheDocument();
  });
});
