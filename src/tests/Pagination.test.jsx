import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../components/Pagination';

describe('Pagination Component', () => {
  it('should render accurate record count text for 10,000 records', () => {
    render(
      <Pagination
        page={1}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 1 to 25 of 10,000 records');
  });

  it('should render 0 to 0 when total records is zero', () => {
    render(
      <Pagination
        page={1}
        limit={25}
        total={0}
        totalPages={0}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 0 to 0 of 0 records');
  });

  it('should disable Previous and First buttons on page 1', () => {
    render(
      <Pagination
        page={1}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const firstBtn = screen.getByTitle('First Page');
    const prevBtn = screen.getByTitle('Previous Page');
    const nextBtn = screen.getByTitle('Next Page');
    const lastBtn = screen.getByTitle('Last Page');

    expect(firstBtn).toBeDisabled();
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
    expect(lastBtn).not.toBeDisabled();
  });

  it('should disable Next and Last buttons on the final page', () => {
    render(
      <Pagination
        page={400}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );

    const firstBtn = screen.getByTitle('First Page');
    const prevBtn = screen.getByTitle('Previous Page');
    const nextBtn = screen.getByTitle('Next Page');
    const lastBtn = screen.getByTitle('Last Page');

    expect(firstBtn).not.toBeDisabled();
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
    expect(lastBtn).toBeDisabled();
  });

  it('should call onPageChange with incremented page when Next is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        page={5}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={handlePageChange}
        onLimitChange={vi.fn()}
      />
    );

    const nextBtn = screen.getByTitle('Next Page');
    fireEvent.click(nextBtn);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(6);
  });

  it('should call onPageChange with decremented page when Previous is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        page={5}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={handlePageChange}
        onLimitChange={vi.fn()}
      />
    );

    const prevBtn = screen.getByTitle('Previous Page');
    fireEvent.click(prevBtn);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('should call onPageChange when a specific numbered page button is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        page={1}
        limit={25}
        total={10000}
        totalPages={400}
        onPageChange={handlePageChange}
        onLimitChange={vi.fn()}
      />
    );

    // Number 3 is within the visible delta on page 1
    const page3Btn = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Btn);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
