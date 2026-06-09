import { Skeleton } from "@/components/ui/skeleton";

function RelicRowSkeleton() {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-14 rounded-md" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-24 rounded-md" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

export default RelicRowSkeleton;
