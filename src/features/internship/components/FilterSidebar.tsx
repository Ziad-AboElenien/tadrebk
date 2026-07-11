'use client';

import { useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export interface InternshipFilters {
  title?: string;
  type?: 'full-time' | 'part-time' | '';
  location?: 'on-site' | 'remote' | 'hybrid' | '';
  companyId?: string;
  closed?: boolean | '';
}

interface FilterSidebarProps {
  filters: InternshipFilters;
  onFiltersChange: (filters: InternshipFilters) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onReset,
}: FilterSidebarProps) {
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, title: e.target.value });
    },
    [filters, onFiltersChange]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        type: (e.target.value as any) || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        location: (e.target.value as any) || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClosedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({
        ...filters,
        closed: value === '' ? undefined : value === 'true',
      });
    },
    [filters, onFiltersChange]
  );

  return (
    <div className="w-full md:w-64 p-6 bg-white rounded-2xl border border-gray-50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg text-dark flex items-center gap-2">
          <i className="fas fa-sliders-h text-sm text-gray-300" />
          Filters
        </h2>
        {(filters.title || filters.type || filters.location || filters.closed) && (
          <button onClick={onReset} className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold transition-colors">
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Title Search */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Search
          </label>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
            <Input
              placeholder="Internship title..."
              value={filters.title || ''}
              onChange={handleTitleChange}
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* Working Time */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Working Time
          </label>
          <Select
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full"
          >
            <option value="">All</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
          </Select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Location
          </label>
          <Select
            value={filters.location || ''}
            onChange={handleLocationChange}
            className="w-full"
          >
            <option value="">All</option>
            <option value="on-site">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Status
          </label>
          <Select
            value={filters.closed === undefined ? '' : String(filters.closed)}
            onChange={handleClosedChange}
            className="w-full"
          >
            <option value="">All</option>
            <option value="false">Open</option>
            <option value="true">Closed</option>
          </Select>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full mt-6"
        onClick={onReset}
      >
        <i className="fas fa-rotate-right text-xs mr-2" />
        Reset Filters
      </Button>
    </div>
  );
}
