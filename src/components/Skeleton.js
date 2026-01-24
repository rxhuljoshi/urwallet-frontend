import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-md bg-muted skeleton-shimmer",
                className
            )}
            {...props}
        />
    );
}

function StatCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
        </div>
    );
}

function TransactionItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-1">
                    <Skeleton className="h-8 w-12 rounded-md" />
                    <Skeleton className="h-8 w-14 rounded-md" />
                </div>
            </div>
        </div>
    );
}

function TransactionListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <TransactionItemSkeleton key={i} />
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6 pb-2">
                <Skeleton className="h-6 w-40" />
            </div>
            <div className="p-6 pt-2">
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background animate-fade-in">
            {/* Header skeleton */}
            <header className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="h-7 w-24" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-20 rounded-md" />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Month/year selector skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>

                {/* Stat cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Charts skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>

                {/* Transactions skeleton */}
                <div className="rounded-lg border bg-card">
                    <div className="p-6 flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </div>
                    <div className="px-6 pb-6">
                        <TransactionListSkeleton count={5} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InsightsSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
        </div>
    );
}

export {
    Skeleton,
    StatCardSkeleton,
    TransactionItemSkeleton,
    TransactionListSkeleton,
    ChartSkeleton,
    DashboardSkeleton,
    InsightsSkeleton,
};
