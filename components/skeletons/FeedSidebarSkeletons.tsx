import { Skeleton } from "@/components/ui/skeleton";

export function StoriesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-3 px-4 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 w-24 sm:h-32 sm:w-28 md:h-36 md:w-32 rounded-2xl">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function SponsorSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DestinationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-2 text-sm">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TripSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-2 text-sm">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TravelerSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-3 text-sm">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
