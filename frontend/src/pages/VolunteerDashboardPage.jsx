import {
    ArrowRight,
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    FileWarning,
    MapPin,
    UsersRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/useAuth";
import { getVolunteerDashboard } from "../services/dashboardApi";
import { getRecommendedCampaigns } from "../services/matchingApi";

const statisticCards = [
    {
        key: "total_applications",
        label: "Applications",
        icon: ClipboardList,
        description: "Campaign applications submitted"
    },
    {
        key: "confirmed_campaigns",
        label: "Confirmed",
        icon: BadgeCheck,
        description: "Confirmed campaign applications"
    },
    {
        key: "assigned_tasks",
        label: "Assigned tasks",
        icon: ClipboardCheck,
        description: "Tasks assigned to your groups"
    },
    {
        key: "completed_tasks",
        label: "Completed tasks",
        icon: UsersRound,
        description: "Tasks verified as complete"
    }
];

const quickActions = [
    {
        label: "Explore campaigns",
        description: "Find your next opportunity",
        to: "/volunteer/campaigns",
        icon: BriefcaseBusiness
    },
    {
        label: "My applications",
        description: "Check your application status",
        to: "/volunteer/applications",
        icon: ClipboardList
    },
    {
        label: "My groups",
        description: "See your campaign groups",
        to: "/volunteer/groups",
        icon: UsersRound
    },
    {
        label: "My tasks",
        description: "Review assigned tasks",
        to: "/volunteer/tasks",
        icon: ClipboardCheck
    },
    {
        label: "Report an issue",
        description: "Share a community concern",
        to: "/volunteer/issues",
        icon: FileWarning
    }
];

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium"
    }).format(date);
}

function formatCampaignDates(startDate, endDate) {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start && end) return `${start} – ${end}`;
    return start || end;
}

function getErrorMessage(error) {
    return typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "We couldn’t load this information. Please try again.";
}

function isExpiredSessionError(error) {
    return error.response?.status === 401 ||
        (error.response?.status === 403 &&
            error.response?.data?.message === "Invalid or expired token");
}

function getCampaignLocation(campaign) {
    const parts = [campaign.city, campaign.state].filter(
        value => typeof value === "string" && value.trim()
    );
    if (parts.length > 0) return parts.join(", ");
    return typeof campaign.location === "string" && campaign.location.trim()
        ? campaign.location
        : null;
}

function VolunteerDashboardPage() {
    const { user, clearSession } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState("");

    const handleRequestError = useCallback(error => {
        if (isExpiredSessionError(error)) {
            clearSession();
            navigate("/login", { replace: true });
            return true;
        }
        return false;
    }, [clearSession, navigate]);

    const loadDashboard = useCallback(async signal => {
        try {
            const result = await getVolunteerDashboard(signal);
            setDashboard(result?.dashboard || null);
            setRecentCampaigns(Array.isArray(result?.recentCampaigns)
                ? result.recentCampaigns
                : []);
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (!handleRequestError(error)) {
                setDashboardError(getErrorMessage(error));
            }
        } finally {
            if (!signal?.aborted) setDashboardLoading(false);
        }
    }, [handleRequestError]);

    const loadRecommendations = useCallback(async signal => {
        try {
            const result = await getRecommendedCampaigns(signal);
            setRecommendations(Array.isArray(result?.recommendations)
                ? result.recommendations
                : []);
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (!handleRequestError(error)) {
                setRecommendationsError(getErrorMessage(error));
            }
        } finally {
            if (!signal?.aborted) setRecommendationsLoading(false);
        }
    }, [handleRequestError]);

    const retryDashboard = useCallback(() => {
        setDashboardLoading(true);
        setDashboardError("");
        loadDashboard();
    }, [loadDashboard]);

    const retryRecommendations = useCallback(() => {
        setRecommendationsLoading(true);
        setRecommendationsError("");
        loadRecommendations();
    }, [loadRecommendations]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (controller.signal.aborted) return;
            loadDashboard(controller.signal);
            loadRecommendations(controller.signal);
        });
        return () => controller.abort();
    }, [loadDashboard, loadRecommendations]);

    const cards = useMemo(() => {
        if (!dashboard) return [];
        return statisticCards
            .filter(({ key }) => dashboard[key] !== undefined && dashboard[key] !== null)
            .map(({ key, ...card }) => ({
                ...card,
                value: Number.isFinite(Number(dashboard[key]))
                    ? Number(dashboard[key]).toLocaleString()
                    : String(dashboard[key])
            }));
    }, [dashboard]);

    return (
        <div className="space-y-9">
            <section aria-labelledby="volunteer-welcome">
                <PageHeader
                    breadcrumb={["Workspace", "Volunteer", "Dashboard"]}
                    description="Your campaigns, contributions, and next opportunities—all in one place."
                    title={`Welcome${user?.fullName ? `, ${user.fullName}` : " back"}`}
                />
                <h2 className="sr-only" id="volunteer-welcome">Volunteer dashboard overview</h2>
                {dashboardLoading ? (
                    <LoadingState label="Loading your dashboard..." />
                ) : dashboardError ? (
                    <ErrorState
                        description={dashboardError}
                        onRetry={retryDashboard}
                        title="Dashboard statistics unavailable"
                    />
                ) : cards.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(({ key, ...card }) => (
                            <StatCard key={key} {...card} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        description="Your dashboard statistics aren’t available yet."
                        title="No statistics to display"
                    />
                )}
            </section>

            <section aria-labelledby="recommendations-title">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage">
                            Pick your next step
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight text-navy sm:text-2xl" id="recommendations-title">
                            Recommended campaigns
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-steel-blue">
                            Opportunities matched to your volunteer profile.
                        </p>
                    </div>
                    <Link
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-sage hover:bg-sage/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                        to="/volunteer/campaigns"
                    >
                        Explore campaigns
                        <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                </div>

                {recommendationsLoading ? (
                    <LoadingState label="Finding campaigns for you..." />
                ) : recommendationsError ? (
                    <ErrorState
                        description={recommendationsError}
                        onRetry={retryRecommendations}
                        title="Recommendations unavailable"
                    />
                ) : recommendations.length === 0 ? (
                    <EmptyState
                        description="There aren’t any campaign recommendations to show right now. Check back later for new opportunities."
                        title="No recommendations yet"
                    />
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {recommendations.map(item => (
                            <CampaignRecommendationCard
                                item={item}
                                key={item.campaign?.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section aria-labelledby="recent-campaigns-title">
                <div className="mb-5">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage">
                        Your activity
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-navy sm:text-2xl" id="recent-campaigns-title">
                        Recent applications
                    </h2>
                </div>
                {dashboardLoading ? (
                    <LoadingState label="Loading your recent applications..." />
                ) : dashboardError ? (
                    <ErrorState
                        description={dashboardError}
                        onRetry={retryDashboard}
                        title="Recent applications unavailable"
                    />
                ) : recentCampaigns.length === 0 ? (
                    <EmptyState
                        description="Campaigns you apply to will appear here."
                        title="No recent applications"
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm shadow-navy/5">
                        <ul className="divide-y divide-navy/8">
                            {recentCampaigns.map(campaign => (
                                <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" key={campaign.id}>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-navy">{campaign.title}</p>
                                        <p className="mt-1 text-sm text-steel-blue">
                                            {campaign.location}
                                            {formatCampaignDates(campaign.start_date, campaign.end_date)
                                                ? ` · ${formatCampaignDates(campaign.start_date, campaign.end_date)}`
                                                : ""}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-dark-blue">
                                        {campaign.application_status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <section aria-labelledby="quick-actions-title">
                <div className="mb-5">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage">
                        Shortcuts
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-navy sm:text-2xl" id="quick-actions-title">
                        Quick actions
                    </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {quickActions.map(({ label, description, to, icon: Icon }) => (
                        <Link
                            className="group flex items-center gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-sm shadow-navy/5 transition hover:-translate-y-0.5 hover:border-sage/35 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                            key={to}
                            to={to}
                        >
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ivory text-sage">
                                <Icon aria-hidden="true" size={21} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-navy">{label}</span>
                                <span className="mt-1 block text-xs text-steel-blue">{description}</span>
                            </span>
                            <ArrowRight
                                aria-hidden="true"
                                className="shrink-0 text-steel-blue transition group-hover:translate-x-1 group-hover:text-sage"
                                size={17}
                            />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

function CampaignRecommendationCard({ item }) {
    const campaign = item.campaign || {};
    const location = getCampaignLocation(campaign);
    const dates = formatCampaignDates(campaign.start_date, campaign.end_date);
    const skills = Array.isArray(campaign.skills)
        ? campaign.skills.map(skill => skill?.name).filter(Boolean)
        : [];

    return (
        <article className="flex h-full flex-col rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {campaign.category && (
                        <span className="inline-flex rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-sage">
                            {campaign.category}
                        </span>
                    )}
                    <h3 className="mt-3 text-lg font-bold leading-snug text-navy">
                        {campaign.title}
                    </h3>
                </div>
                <div className="shrink-0 rounded-xl bg-sage/10 px-3 py-2 text-right">
                    <p className="text-xl font-bold text-sage">{item.matchScore}%</p>
                    <p className="text-[11px] font-medium text-steel-blue">Match</p>
                </div>
            </div>

            {campaign.description && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-steel-blue">
                    {campaign.description}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-steel-blue">
                {location && (
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="text-sage" size={14} />
                        {location}
                    </span>
                )}
                {dates && (
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" className="text-sage" size={14} />
                        {dates}
                    </span>
                )}
            </div>

            {skills.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-semibold text-dark-blue">Required skills</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {skills.map(skill => (
                            <span
                                className="rounded-full border border-navy/10 px-2.5 py-1 text-xs text-steel-blue"
                                key={skill}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-auto pt-5">
                {campaign.id ? (
                    <Link
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sage/40 px-4 py-2 text-sm font-semibold text-sage transition hover:bg-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                        to={`/volunteer/campaigns/${encodeURIComponent(campaign.id)}`}
                    >
                        View details
                        <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-navy/10 px-4 py-2 text-sm font-medium text-steel-blue">
                        Campaign details unavailable
                    </span>
                )}
            </div>
        </article>
    );
}

export default VolunteerDashboardPage;
