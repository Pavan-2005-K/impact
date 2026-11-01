import { ArrowLeft, CalendarDays, LoaderCircle, MapPin, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { applyForCampaign } from "../services/applicationApi";
import { getVolunteerCampaigns } from "../services/campaignApi";

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function CampaignDetailsPage() {
    const { campaignId } = useParams();
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [applicationError, setApplicationError] = useState("");
    const [applying, setApplying] = useState(false);

    const handleApply = async () => {
        if (applying || !item?.campaign?.id) return;
        setApplying(true);
        setApplicationError("");
        try {
            const result = await applyForCampaign(item.campaign.id);
            navigate("/volunteer/applications", {
                state: { successMessage: result.message }
            });
        } catch (error) {
            if (error.response?.status === 401 ||
                (error.response?.status === 403 &&
                    error.response?.data?.message === "Invalid or expired token")) {
                clearSession();
                navigate("/login", { replace: true });
                return;
            }
            if (error.response?.status === 409) {
                setApplicationError("You have already applied for this campaign.");
            } else {
                setApplicationError(typeof error.response?.data?.message === "string"
                    ? error.response.data.message
                    : "We couldn’t submit your application. Please try again.");
            }
        } finally {
            setApplying(false);
        }
    };

    const loadCampaign = useCallback(async signal => {
        try {
            const result = await getVolunteerCampaigns(signal);
            const found = result.campaigns.find(
                recommendation => String(recommendation.campaign?.id) === campaignId
            );
            setItem(found || null);
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (error.response?.status === 401 ||
                (error.response?.status === 403 &&
                    error.response?.data?.message === "Invalid or expired token")) {
                clearSession();
                navigate("/login", { replace: true });
                return;
            }
            setErrorMessage(typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : error.message || "We couldn’t load this campaign. Please try again.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [campaignId, clearSession, navigate]);

    const retry = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadCampaign();
    }, [loadCampaign]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadCampaign(controller.signal);
        });
        return () => controller.abort();
    }, [loadCampaign]);

    if (loading) {
        return <LoadingState label="Loading campaign details..." />;
    }

    if (errorMessage) {
        return (
            <ErrorState
                description={errorMessage}
                onRetry={retry}
                title="Campaign details unavailable"
            />
        );
    }

    if (!item?.campaign) {
        return (
            <EmptyState
                action={
                    <Link
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sage hover:bg-sage/5"
                        to="/volunteer/campaigns"
                    >
                        <ArrowLeft aria-hidden="true" size={16} />
                        Back to campaigns
                    </Link>
                }
                description="This campaign may no longer be published or available to volunteers."
                title="Campaign not found"
            />
        );
    }

    const { campaign } = item;
    const hasMatchScore = item.matchScore != null && Number.isFinite(Number(item.matchScore));
    const dates = [formatDate(campaign.start_date), formatDate(campaign.end_date)]
        .filter(Boolean);
    const location = [campaign.city, campaign.state]
        .filter(value => typeof value === "string" && value.trim())
        .join(", ") || campaign.location;
    const skills = Array.isArray(campaign.skills)
        ? campaign.skills.map(skill => skill?.name).filter(Boolean)
        : [];

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Link
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-sage hover:bg-sage/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                to="/volunteer/campaigns"
            >
                <ArrowLeft aria-hidden="true" size={16} />
                Back to campaigns
            </Link>
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "Explore Campaigns", campaign.title]}
                description={campaign.category || "Campaign details"}
                title={campaign.title || "Campaign details"}
            />

            <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                    {campaign.category && (
                        <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">
                            {campaign.category}
                        </span>
                    )}
                    {campaign.status && (
                        <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-dark-blue">
                            {campaign.status}
                        </span>
                    )}
                    {hasMatchScore && (
                        <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-dark-blue">
                            {item.matchScore}% match
                        </span>
                    )}
                </div>

                <p className="mt-6 whitespace-pre-line text-sm leading-7 text-dark-blue">
                    {campaign.description || "No description provided."}
                </p>

                <dl className="mt-7 grid gap-4 border-t border-navy/8 pt-6 sm:grid-cols-2">
                    {location && (
                        <div className="flex items-start gap-3">
                            <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={19} />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Location</dt>
                                <dd className="mt-1 text-sm font-medium text-navy">{location}</dd>
                            </div>
                        </div>
                    )}
                    {dates.length > 0 && (
                        <div className="flex items-start gap-3">
                            <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={19} />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Dates</dt>
                                <dd className="mt-1 text-sm font-medium text-navy">
                                    {dates.length === 2 ? `${dates[0]} – ${dates[1]}` : dates[0]}
                                </dd>
                            </div>
                        </div>
                    )}
                    {(campaign.required_volunteers != null || campaign.max_volunteers != null) && (
                        <div className="flex items-start gap-3">
                            <UsersRound aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={19} />
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Volunteer capacity</dt>
                                <dd className="mt-1 text-sm font-medium text-navy">
                                    {campaign.required_volunteers != null
                                        ? `${campaign.required_volunteers} required`
                                        : "Details unavailable"}
                                    {campaign.max_volunteers != null
                                        ? ` · Maximum ${campaign.max_volunteers}`
                                        : ""}
                                </dd>
                            </div>
                        </div>
                    )}
                </dl>

                {skills.length > 0 && (
                    <section aria-labelledby="campaign-skills-heading" className="mt-7 border-t border-navy/8 pt-6">
                        <h2 className="text-sm font-bold text-navy" id="campaign-skills-heading">
                            Required skills
                        </h2>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <li className="rounded-full border border-steel-blue/15 px-3 py-1.5 text-sm text-dark-blue" key={`${skill}-${index}`}>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="mt-8 border-t border-navy/8 pt-6">
                    {applicationError && (
                        <p aria-live="polite" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                            {applicationError}
                        </p>
                    )}
                    <button
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sage px-6 py-3 text-sm font-bold text-white transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={applying}
                        onClick={handleApply}
                        type="button"
                    >
                        {applying && <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />}
                        {applying ? "Submitting..." : "Apply Now"}
                    </button>
                </div>
            </article>
        </div>
    );
}

export default CampaignDetailsPage;
