export default function InternshipDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-5 h-4 w-48 rounded bg-gray-200" />
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gray-200" />
              <div className="space-y-3">
                <div className="h-7 w-64 rounded bg-gray-200" />
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="h-9 w-28 rounded-lg bg-gray-200" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="mt-6 h-5 w-40 rounded bg-gray-200" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 rounded-full bg-gray-200" />
              <div className="h-7 w-20 rounded-full bg-gray-200" />
              <div className="h-7 w-20 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
