'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import InternshipCard from '@/components/ui/InternshipCard';
import FilterSidebar from '@/components/shared/FilterSidebar';
import type { InternshipFilters } from '@/components/shared/FilterSidebar';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import { Internship } from '@/types/internship';
import { internshipService } from '@/services/internship.service';
import { toast } from 'react-toastify';

export default function InternshipsPage() {
  const searchParams = useSearchParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<InternshipFilters>({
    title: searchParams.get('title') || '',
    type: (searchParams.get('type') as any) || '',
    location: (searchParams.get('location') as any) || '',
  });

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      const result = await internshipService.listInternships({
        ...filters,
        page,
        limit: 12,
      });
      setInternships(result.internships);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load internships', {
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleFiltersChange = useCallback((newFilters: InternshipFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Internship Opportunities
          </h1>
          <p className="text-slate-600">
            Discover and apply to internships that match your skills and interests
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
            />
          </aside>

          {/* Internships Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : internships.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  No internships found matching your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {internships.map((internship) => (
                    <InternshipCard
                      key={internship._id}
                      internship={internship}
                      compact={false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
