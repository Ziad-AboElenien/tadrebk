'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InternshipCard from '@/components/ui/InternshipCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Internship } from '@/types/internship';
import { internshipService } from '@/services/internship.service';
import { toast } from 'react-toastify';

const categories = [
  { icon: '💻', name: 'Engineering', color: 'bg-blue-100' },
  { icon: '🎨', name: 'Design', color: 'bg-purple-100' },
  { icon: '📊', name: 'Data Science', color: 'bg-green-100' },
  { icon: '📱', name: 'Marketing', color: 'bg-pink-100' },
  { icon: '💼', name: 'Business', color: 'bg-yellow-100' },
];

export default function HomePage() {
  const [featuredInternships, setFeaturedInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const result = await internshipService.listInternships({
          limit: 6,
          closed: false,
        });
        setFeaturedInternships(result.internships);
      } catch (error: any) {
        toast.error('Failed to load internships', {
          position: 'bottom-right',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Launch Your Career with Tadrebak
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Connect with top companies and discover internship opportunities that match your skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/internships">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                >
                  Explore Internships
                </Button>
              </Link>
              <Link href="/get-started">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-blue-700 w-full sm:w-auto"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">1000+</p>
              <p className="text-slate-600">Active Internships</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">500+</p>
              <p className="text-slate-600">Partner Companies</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">10K+</p>
              <p className="text-slate-600">Successful Placements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href="/internships">
                <div className={`${category.color} p-6 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer`}>
                  <p className="text-3xl mb-2">{category.icon}</p>
                  <p className="font-semibold text-slate-900">{category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              Featured Opportunities
            </h2>
            <Link href="/internships">
              <Button variant="outline" size="md">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : featuredInternships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No internships available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredInternships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Internship?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of students who have launched their careers through Tadrebak
          </p>
          <Link href="/get-started">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
