import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { getMyApplications } from "../services/applicationApi";

const statusStyles = {
    PENDING: "bg-warm-beige/45 text-dark-blue",
    CONFIRMED: "bg-sage/15 text-sage",
    WAITLISTED: "bg-steel-blue/10 text-steel-blue",
    REJECTED: "bg-red-100 text-red-800"
};

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function VolunteerApplicationsPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

    const loadApplications = useCallback(async signal => {
        try {
            const result = await getMyApplications(signal);
            setApplications(Array.isArray(result?.applications) ? result.applications : []);
            setCount(Number.isInteger(result?.count) ? result.count : null);
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
                : "We couldn’t load your applications. Please try again.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [clearSession, navigate]);

    const retry = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadApplications();
    }, [loadApplications]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadApplications(controller.signal);
        });
        return () => controller.abort();
    }, [loadApplications]);

    const statuses = useMemo(() => [...new Set(
        applications.map(application => application.status).filter(Boolean)
    )].sort(), [applications]);
    const filteredApplications = useMemo(() => applications.filter(application =>
        !statusFilter || application.status === statusFilter
    ), [applications, statusFilter]);

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "My Applications"]}
                description="Track the campaigns you’ve applied to and check their latest status."
                title="My Applications"
            />

            {successMessage && (
                <div className="flex items-start justify-between gap-4 rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-dark-blue" role="status">
                    <p>{successMessage}</p>
                    <button
                        aria-label="Dismiss success message"
                        className="font-semibold text-sage hover:underline"
                        onClick={() => setSuccessMessage("")}
                        type="button"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                {!loading && !errorMessage && (
                    <p aria-live="polite" className="text-sm font-medium text-steel-blue">
                        {count === null
                            ? `${applications.length} ${applications.length === 1 ? "application" : "applications"}`
                            : `${count} ${count === 1 ? "application" : "applications"}`}
                    </p>
                )}
                {statuses.length > 1 && (
                    <label className="flex items-center gap-2 text-sm text-steel-blue">
                        Filter by status
                        <select
                            className="min-h-10 rounded-lg border border-steel-blue/25 bg-white px-3 text-sm text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                            onChange={event => setStatusFilter(event.target.value)}
                            value={statusFilter}
                        >
                            <option value="">All statuses</option>
                            {statuses.map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                        </select>
                    </label>
                )}
            </div>

            {loading ? (
                <LoadingState label="Loading your applications..." />
            ) : errorMessage ? (
                <ErrorState description={errorMessage} onRetry={retry} title="Applications unavailable" />
            ) : filteredApplications.length === 0 ? (
                <EmptyState
                    action={applications.length === 0 ? (
                        <Link className="font-semibold text-sage hover:underline" to="/volunteer/campaigns">
                            Explore campaigns
                        </Link>
                    ) : undefined}
                    description={applications.length === 0
                        ? "When you apply to a campaign, it will appear here."
                        : "There are no applications with this status."}
                    icon={ClipboardList}
                    title={applications.length === 0 ? "No applications yet" : "No matching applications"}
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {filteredApplications.map(application => {
                        const appliedAt = formatDate(application.applied_at);
                        const startDate = formatDate(application.start_date);
                        const endDate = formatDate(application.end_date);
                        const locationText = [application.city, application.location]
                            .filter((value, index, values) => value && values.indexOf(value) === index)
                            .join(", ");
                        const status = application.status || "UNKNOWN";

                        return (
                            <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5" key={application.application_id}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold text-navy">
                                            {application.title || "Campaign"}
                                        </h2>
                                        {application.organization_name && (
                                            <p className="mt-1 text-sm text-steel-blue">
                                                {application.organization_name}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || "bg-ivory text-dark-blue"}`}>
                                        {status.replaceAll("_", " ")}
                                    </span>
                                </div>

                                <dl className="mt-5 grid gap-3 text-sm text-dark-blue">
                                    {locationText && (
                                        <div className="flex items-start gap-2">
                                            <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={17} />
                                            <dd>{locationText}</dd>
                                        </div>
                                    )}
                                    {(startDate || endDate) && (
                                        <div className="flex items-start gap-2">
                                            <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={17} />
                                            <dd>{startDate && endDate ? `${startDate} – ${endDate}` : startDate || endDate}</dd>
                                        </div>
                                    )}
                                    {appliedAt && <div><dt className="inline text-steel-blue">Applied: </dt><dd className="inline">{appliedAt}</dd></div>}
                                    {application.match_score != null && (
                                        <div><dt className="inline text-steel-blue">Match score: </dt><dd className="inline">{application.match_score}%</dd></div>
                                    )}
                                </dl>

                                {application.campaign_id != null && (
                                    <Link
                                        className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-steel-blue/20 px-3 py-2 text-sm font-semibold text-navy hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                                        to={`/volunteer/campaigns/${encodeURIComponent(application.campaign_id)}`}
                                    >
                                        View campaign
                                    </Link>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default VolunteerApplicationsPage;
