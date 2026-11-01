import { BriefcaseBusiness, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampaignCard from "../components/campaigns/CampaignCard";
import CampaignGridSkeleton from "../components/campaigns/CampaignGridSkeleton";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { getVolunteerCampaigns } from "../services/campaignApi";

function getErrorMessage(error) {
    if (typeof error.response?.data?.message === "string") {
        return error.response.data.message;
    }
    return error.message || "We couldn’t load campaigns. Please try again.";
}

function isExpiredSessionError(error) {
    return error.response?.status === 401 ||
        (error.response?.status === 403 &&
            error.response?.data?.message === "Invalid or expired token");
}

function getLocationOptions(items) {
    const values = items.flatMap(({ campaign }) =>
        [campaign.city, campaign.state, campaign.location]
            .filter(value => typeof value === "string" && value.trim())
    );
    return [...new Map(values.map(value => [value.trim().toLowerCase(), value.trim()])).values()]
        .sort((left, right) => left.localeCompare(right));
}

function VolunteerCampaignsPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [campaignCount, setCampaignCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("");

    const loadCampaigns = useCallback(async signal => {
        try {
            const result = await getVolunteerCampaigns(signal);
            setItems(result.campaigns);
            setCampaignCount(result.count);
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (isExpiredSessionError(error)) {
                clearSession();
                navigate("/login", { replace: true });
                return;
            }
            setErrorMessage(getErrorMessage(error));
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [clearSession, navigate]);

    const retry = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadCampaigns();
    }, [loadCampaigns]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadCampaigns(controller.signal);
        });
        return () => controller.abort();
    }, [loadCampaigns]);

    const categories = useMemo(() => [...new Set(
        items.map(({ campaign }) => campaign.category).filter(Boolean)
    )].sort((left, right) => left.localeCompare(right)), [items]);
    const locations = useMemo(() => getLocationOptions(items), [items]);
    const statuses = useMemo(() => [...new Set(
        items.map(({ campaign }) => campaign.status).filter(Boolean)
    )].sort((left, right) => left.localeCompare(right)), [items]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return items.filter(({ campaign }) => {
            const matchesSearch = !normalizedSearch ||
                [campaign.title, campaign.description]
                    .some(value => typeof value === "string" && value.toLowerCase().includes(normalizedSearch));
            const matchesCategory = !category || campaign.category === category;
            const matchesLocation = !location ||
                [campaign.city, campaign.state, campaign.location]
                    .some(value => typeof value === "string" && value.toLowerCase() === location.toLowerCase());
            const matchesStatus = !status || campaign.status === status;
            return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
        });
    }, [category, items, location, search, status]);

    const hasFilters = Boolean(search || category || location || status);
    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setLocation("");
        setStatus("");
    };

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "Explore Campaigns"]}
                description="Discover opportunities to make a difference in your community."
                title="Explore Campaigns"
            />

            {!loading && !errorMessage && (
                <p className="text-sm font-medium text-steel-blue" aria-live="polite">
                    {campaignCount !== null
                        ? `Showing ${filteredItems.length} of ${campaignCount} ${campaignCount === 1 ? "campaign" : "campaigns"}`
                        : `${filteredItems.length} ${filteredItems.length === 1 ? "campaign" : "campaigns"}`}
                </p>
            )}

            <section
                aria-label="Search and filter campaigns"
                className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm shadow-navy/5 sm:p-5"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="relative block">
                        <span className="sr-only">Search campaigns</span>
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-blue"
                            size={18}
                        />
                        <input
                            className="min-h-11 w-full rounded-xl border border-steel-blue/25 bg-white py-2 pl-10 pr-10 text-sm text-navy outline-none placeholder:text-steel-blue/70 focus:border-sage focus:ring-2 focus:ring-sage/20"
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search title or description"
                            type="search"
                            value={search}
                        />
                        {search && (
                            <button
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-steel-blue hover:bg-ivory"
                                onClick={() => setSearch("")}
                                type="button"
                            >
                                <X aria-hidden="true" size={16} />
                            </button>
                        )}
                    </label>

                    <label className="sr-only" htmlFor="campaign-category">Category</label>
                    <select
                        className="min-h-11 rounded-xl border border-steel-blue/25 bg-white px-3 text-sm text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                        id="campaign-category"
                        onChange={event => setCategory(event.target.value)}
                        value={category}
                    >
                        <option value="">All categories</option>
                        {categories.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>

                    <label className="sr-only" htmlFor="campaign-location">Location</label>
                    <select
                        className="min-h-11 rounded-xl border border-steel-blue/25 bg-white px-3 text-sm text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                        id="campaign-location"
                        onChange={event => setLocation(event.target.value)}
                        value={location}
                    >
                        <option value="">All locations</option>
                        {locations.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>

                    {statuses.length > 1 ? (
                        <>
                            <label className="sr-only" htmlFor="campaign-status">Status</label>
                            <select
                                className="min-h-11 rounded-xl border border-steel-blue/25 bg-white px-3 text-sm text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="campaign-status"
                                onChange={event => setStatus(event.target.value)}
                                value={status}
                            >
                                <option value="">All statuses</option>
                                {statuses.map(value => <option key={value} value={value}>{value}</option>)}
                            </select>
                        </>
                    ) : null}
                </div>
                {hasFilters && (
                    <button
                        className="mt-3 rounded-lg px-2 py-1.5 text-sm font-semibold text-sage hover:bg-sage/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                        onClick={clearFilters}
                        type="button"
                    >
                        Clear filters
                    </button>
                )}
            </section>

            {loading ? (
                <CampaignGridSkeleton />
            ) : errorMessage ? (
                <ErrorState
                    description={errorMessage}
                    onRetry={retry}
                    title="Campaigns unavailable"
                />
            ) : filteredItems.length === 0 ? (
                <EmptyState
                    description={items.length === 0
                        ? "Published future campaigns will appear here when available."
                        : "Try changing or clearing your filters to see more campaigns."}
                    icon={BriefcaseBusiness}
                    title={items.length === 0 ? "No campaigns available" : "No matching campaigns"}
                    action={hasFilters ? (
                        <button
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-sage hover:bg-sage/5"
                            onClick={clearFilters}
                            type="button"
                        >
                            Clear filters
                        </button>
                    ) : (
                        <Link className="text-sm font-semibold text-sage hover:underline" to="/volunteer/dashboard">
                            Return to dashboard
                        </Link>
                    )}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredItems.map((item, index) => (
                        <CampaignCard
                            item={item}
                            key={item.campaign?.id ?? `${item.campaign?.title}-${index}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default VolunteerCampaignsPage;
