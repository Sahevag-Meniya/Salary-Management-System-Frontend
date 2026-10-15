import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

describe('DeleteConfirmModal Component', () => {
  const sampleEmployee = {
    id: 1042,
    name: 'Rahul Sharma',
    department: 'Operations',
    country: 'India',
  };

  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        employee={sampleEmployee}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render modal with employee details when isOpen is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        employee={sampleEmployee}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Employee Salary Record?')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText(/Department: Operations • Country: India/i)).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        employee={sampleEmployee}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when Confirm Delete button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        employee={sampleEmployee}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should display loading state and disable buttons when isDeleting is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        employee={sampleEmployee}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
