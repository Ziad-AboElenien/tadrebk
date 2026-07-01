import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary/20 mb-6">404</div>
        <h1 className="text-3xl font-black text-dark mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
          >
            <i className="fas fa-home text-xs" />
            Go Home
          </Link>
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 bg-white text-dark px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 hover:border-gray-300 transition-all"
          >
            <i className="fas fa-search text-xs" />
            Browse Internships
          </Link>
        </div>
      </div>
    </div>
  );
}
