import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('should render brand logo, title and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Salary Manager')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Compensation Tool')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /salary structure/i })).toBeInTheDocument();
  });

  it('should mark the active link with highlight class when on Dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-indigo-600');
  });

  it('should mark the active link with highlight class when on Structures route', () => {
    render(
      <MemoryRouter initialEntries={['/structures']}>
        <Navbar />
      </MemoryRouter>
    );

    const structuresLink = screen.getByRole('link', { name: /salary structure/i });
    expect(structuresLink).toHaveClass('bg-indigo-600');
  });
});
