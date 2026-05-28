export function PaperLoadingState() {
  return (
    <div className="max-w-[980px] mx-auto animate-pulse">
      {/* Action banner skeleton */}
      <div className="rounded-3xl bg-[#181818]/30 p-6 lg:p-8 mb-5">
        <div className="h-3 w-24 bg-white/10 rounded mb-4" />
        <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
        <div className="h-4 w-1/2 bg-white/10 rounded mb-5" />
        <div className="flex gap-3">
          <div className="h-9 w-28 bg-white/10 rounded-full" />
          <div className="h-9 w-36 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Paper skeleton */}
      <div className="rounded-3xl bg-white/60 p-6 lg:p-10">
        <div className="text-center space-y-3 mb-8">
          <div className="h-5 w-64 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
          <div className="h-3 w-56 bg-gray-100 rounded mx-auto" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-6 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
