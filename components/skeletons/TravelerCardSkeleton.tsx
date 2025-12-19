import { Skeleton } from "@/components/ui/skeleton";

export function TravelerCardSkeleton() {
  return (
    <div className="card-surface p-6">
      <div className="flex flex-col items-center text-center">
        <Skeleton className="h-20 w-20 rounded-full mb-4" />
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TravelerCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TravelerCardSkeleton key={i} />
      ))}
    </div>
  );
}
