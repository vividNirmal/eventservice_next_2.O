import { Card, CardContent, CardHeader } from "@/components/ui/card";

const EventCardSkeleton = () => (
  <Card className="shadow-sm border !gap-0 !p-0 overflow-hidden">
    <CardHeader className="py-5 px-0 min-h-40 flex flex-col items-center justify-center bg-gray-200 animate-pulse">
      <div className="h-8 w-32 bg-gray-300 rounded"></div>
    </CardHeader>
    <CardContent className="p-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="pt-2 flex flex-row justify-end">
          <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EventListSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <EventCardSkeleton key={index} />
    ))}
  </div>
);

export { EventCardSkeleton, EventListSkeleton };
