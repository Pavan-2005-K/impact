function CampaignGridSkeleton() {
    return (
        <div
            aria-label="Loading campaigns"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            role="status"
        >
            {Array.from({ length: 6 }, (_, index) => (
                <div
                    className="animate-pulse rounded-2xl border border-navy/8 bg-white p-5"
                    key={index}
                >
                    <div className="h-5 w-24 rounded bg-ivory" />
                    <div className="mt-4 h-6 w-3/4 rounded bg-ivory" />
                    <div className="mt-4 h-4 rounded bg-ivory" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-ivory" />
                    <div className="mt-6 h-4 w-1/2 rounded bg-ivory" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-ivory" />
                    <div className="mt-8 h-11 rounded-xl bg-ivory" />
                </div>
            ))}
            <span className="sr-only">Loading campaigns...</span>
        </div>
    );
}

export default CampaignGridSkeleton;
