import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CampaignCard from "../components/campaigns/CampaignCard";
import CampaignGridSkeleton from "../components/campaigns/CampaignGridSkeleton";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { getAIMatchingRecommendations, getRecommendedCampaigns } from "../services/matchingApi";
import { useNavigate } from "react-router-dom";

const scoreDimensions = [
    ["skills", "Skills"],
    ["location", "Location"],
    ["availability", "Availability"],
    ["performance", "Performance"]
];

function getErrorMessage(error) {
    return typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "We couldn’t load recommendations. Please try again.";
}

function isExpiredSessionError(error) {
    return error.response?.status === 401 ||
        (error.response?.status === 403 &&
            error.response?.data?.message === "Invalid or expired token");
}

function getMatchLevel(score) {
    if (score >= 75) {
        return { label: "High match", className: "bg-sage/15 text-sage" };
    }
    if (score >= 50) {
        return { label: "Medium match", className: "bg-warm-beige/40 text-dark-blue" };
    }
    return { label: "Low match", className: "bg-steel-blue/10 text-steel-blue" };
}

function VolunteerRecommendationsPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [aiExplanation, setAiExplanation] = useState("");
    const [aiLoading, setAiLoading] = useState(true);
    const [aiError, setAiError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const handleExpiredSession = useCallback(error => {
        if (!isExpiredSessionError(error)) return false;
        clearSession();
        navigate("/login", { replace: true });
        return true;
    }, [clearSession, navigate]);

    const loadRecommendations = useCallback(async signal => {
        try {
            const result = await getRecommendedCampaigns(signal);
            setRecommendations(Array.isArray(result?.recommendations)
                ? result.recommendations
                : []);
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (!handleExpiredSession(error)) setErrorMessage(getErrorMessage(error));
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [handleExpiredSession]);

    const loadAIExplanation = useCallback(async signal => {
        try {
            const result = await getAIMatchingRecommendations(signal);
            setAiExplanation(typeof result?.data?.aiExplanation === "string"
                ? result.data.aiExplanation
                : "");
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (!handleExpiredSession(error)) setAiError(getErrorMessage(error));
        } finally {
            if (!signal?.aborted) setAiLoading(false);
        }
    }, [handleExpiredSession]);

    const retryRecommendations = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadRecommendations();
    }, [loadRecommendations]);

    const retryAIExplanation = useCallback(() => {
        setAiLoading(true);
        setAiError("");
        loadAIExplanation();
    }, [loadAIExplanation]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (controller.signal.aborted) return;
            loadRecommendations(controller.signal);
            loadAIExplanation(controller.signal);
        });
        return () => controller.abort();
    }, [loadAIExplanation, loadRecommendations]);

    const categories = useMemo(() => [...new Set(
        recommendations.map(item => item.campaign?.category).filter(Boolean)
    )].sort((left, right) => left.localeCompare(right)), [recommendations]);
    const filteredRecommendations = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return recommendations.filter(({ campaign = {} }) => {
            const matchesSearch = !normalizedSearch ||
                [campaign.title, campaign.description]
                    .some(value => typeof value === "string" && value.toLowerCase().includes(normalizedSearch));
            return matchesSearch && (!category || campaign.category === category);
        });
    }, [category, recommendations, search]);

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "AI Recommendations"]}
                description="Explore campaigns ranked using your skills, location, availability, and performance data."
                title="AI Campaign Recommendations"
            />

            <section aria-labelledby="ai-explanation-heading" className="rounded-2xl border border-sage/20 bg-white p-5 shadow-sm shadow-navy/5 sm:p-6">
                <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-sage/10 text-sage">
                        <Sparkles aria-hidden="true" size={20} />
                    </span>
                    <h2 className="font-bold text-navy" id="ai-explanation-heading">
                        Why these opportunities?
                    </h2>
                </div>
                {aiLoading ? (
                    <LoadingState label="Preparing your recommendation explanation..." />
                ) : aiError ? (
                    <ErrorState
                        description={aiError}
                        onRetry={retryAIExplanation}
                        title="AI explanation unavailable"
                    />
                ) : aiExplanation ? (
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-dark-blue">
                        {aiExplanation}
                    </p>
                ) : (
                    <p className="mt-4 text-sm leading-6 text-steel-blue">
                        No explanation was returned. Match scores and their backend-provided
                        breakdowns are shown below when available.
                    </p>
                )}
            </section>

            <section aria-label="Filter recommendations" className="grid gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-sm shadow-navy/5 sm:grid-cols-2">
                <label className="block">
                    <span className="sr-only">Search recommendations</span>
                    <input
                        className="min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm text-navy outline-none placeholder:text-steel-blue/70 focus:border-sage focus:ring-2 focus:ring-sage/20"
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search title or description"
                        type="search"
                        value={search}
                    />
                </label>
                <label className="sr-only" htmlFor="recommendation-category">Category</label>
                <select
                    className="min-h-11 rounded-xl border border-steel-blue/25 bg-white px-3 text-sm text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                    id="recommendation-category"
                    onChange={event => setCategory(event.target.value)}
                    value={category}
                >
                    <option value="">All categories</option>
                    {categories.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
            </section>

            {loading ? (
                <CampaignGridSkeleton />
            ) : errorMessage ? (
                <ErrorState
                    description={errorMessage}
                    onRetry={retryRecommendations}
                    title="Recommendations unavailable"
                />
            ) : filteredRecommendations.length === 0 ? (
                <EmptyState
                    description={recommendations.length === 0
                        ? "There are no upcoming published campaigns available for matching right now."
                        : "Try changing your search or category filter."}
                    icon={Sparkles}
                    title={recommendations.length === 0
                        ? "No recommendations yet"
                        : "No matching recommendations"}
                />
            ) : (
                <div className="space-y-5">
                    {filteredRecommendations.map((item, index) => {
                        const numericScore = Number(item.matchScore);
                        const matchLevel = Number.isFinite(numericScore)
                            ? getMatchLevel(numericScore)
                            : null;
                        const breakdown = item.breakdown || {};

                        return (
                            <article className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm shadow-navy/5 sm:p-5" key={item.campaign?.id ?? index}>
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    {matchLevel ? (
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${matchLevel.className}`}>
                                            {matchLevel.label} · {numericScore}%
                                        </span>
                                    ) : (
                                        <span className="text-sm text-steel-blue">Match score unavailable</span>
                                    )}
                                    <span className="text-xs text-steel-blue">
                                        Match levels are based on the returned score.
                                    </span>
                                </div>
                                <CampaignCard item={item} />
                                <div className="mt-4 border-t border-navy/8 pt-4">
                                    <h3 className="text-sm font-bold text-navy">Match breakdown</h3>
                                    {scoreDimensions.some(([key]) => breakdown[key] != null) ? (
                                        <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                            {scoreDimensions.map(([key, label]) => {
                                                const score = breakdown[key];
                                                if (score == null || !Number.isFinite(Number(score))) return null;
                                                return (
                                                    <div className="rounded-xl bg-ivory/70 px-3 py-2" key={key}>
                                                        <dt className="text-xs text-steel-blue">{label}</dt>
                                                        <dd className="mt-1 font-semibold text-navy">{score}%</dd>
                                                    </div>
                                                );
                                            })}
                                        </dl>
                                    ) : (
                                        <p className="mt-2 text-sm text-steel-blue">
                                            The backend did not return a score breakdown for this campaign.
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default VolunteerRecommendationsPage;
