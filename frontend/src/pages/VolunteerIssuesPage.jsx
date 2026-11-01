import { AlertCircle, FileWarning, ImagePlus, LoaderCircle, MapPin, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { createIssueReport, getMyIssueReports } from "../services/issueApi";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumImageSize = 5 * 1024 * 1024;
const statusStyles = {
    PENDING: "bg-warm-beige/45 text-dark-blue",
    UNDER_REVIEW: "bg-steel-blue/10 text-steel-blue",
    ACCEPTED: "bg-sage/15 text-sage",
    REJECTED: "bg-red-100 text-red-800",
    RESOLVED: "bg-sage/15 text-sage"
};

const initialForm = {
    title: "",
    description: "",
    category: "",
    location: "",
    city: "",
    state: ""
};

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function VolunteerIssuesPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState("");
    const [form, setForm] = useState(initialForm);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const imageInputRef = useRef(null);

    const handleUnauthorized = useCallback(() => {
        clearSession();
        navigate("/login", { replace: true });
    }, [clearSession, navigate]);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const loadReports = useCallback(async signal => {
        try {
            const result = await getMyIssueReports(signal);
            setReports(Array.isArray(result?.reports) ? result.reports : []);
            setReportsError("");
        } catch (error) {
            if (error.code === "ERR_CANCELED") return;
            if (error.response?.status === 401 ||
                (error.response?.status === 403 &&
                    error.response?.data?.message === "Invalid or expired token")) {
                handleUnauthorized();
                return;
            }
            setReportsError(typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : "We couldn’t load your reports. Please try again.");
        } finally {
            if (!signal?.aborted) setReportsLoading(false);
        }
    }, [handleUnauthorized]);

    const retryReports = useCallback(() => {
        setReportsLoading(true);
        setReportsError("");
        loadReports();
    }, [loadReports]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadReports(controller.signal);
        });
        return () => controller.abort();
    }, [loadReports]);

    const handleFieldChange = event => {
        const { name, value } = event.target;
        setForm(current => ({ ...current, [name]: value }));
    };

    const handleImageChange = event => {
        const selectedFile = event.target.files?.[0] || null;
        setImage(null);
        setPreviewUrl("");
        setValidationMessage("");
        if (!selectedFile) return;
        if (!allowedImageTypes.includes(selectedFile.type)) {
            setValidationMessage("Choose a JPEG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }
        if (selectedFile.size > maximumImageSize) {
            setValidationMessage("The image must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }
        setImage(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        if (submitting) return;
        setValidationMessage("");
        setSubmitError("");
        setSuccessMessage("");
        const requiredFields = ["title", "description", "category", "location", "city"];
        if (requiredFields.some(field => !form[field].trim())) {
            setValidationMessage("Title, description, category, location, and city are required.");
            return;
        }
        if (image && (!allowedImageTypes.includes(image.type) || image.size > maximumImageSize)) {
            setValidationMessage("Use a JPEG, PNG, or WebP image no larger than 5 MB.");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createIssueReport({
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
                location: form.location.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                image
            });
            setSuccessMessage(result.message || "Your issue report was submitted.");
            setForm(initialForm);
            setImage(null);
            setPreviewUrl("");
            if (imageInputRef.current) imageInputRef.current.value = "";
            await loadReports();
        } catch (error) {
            if (error.response?.status === 401 ||
                (error.response?.status === 403 &&
                    error.response?.data?.message === "Invalid or expired token")) {
                handleUnauthorized();
                return;
            }
            setSubmitError(typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : "We couldn’t submit your report. Please review the details and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "Issue Reports"]}
                description="Report a community concern and follow its review status."
                title="Community Issue Reporting"
            />

            <section aria-labelledby="create-issue-heading" className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sage">
                        <FileWarning aria-hidden="true" size={20} />
                    </span>
                    <div>
                        <h2 className="font-bold text-navy" id="create-issue-heading">Create a report</h2>
                        <p className="text-sm text-steel-blue">Fields marked required must be provided.</p>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {(validationMessage || submitError || successMessage) && (
                        <div
                            aria-live="polite"
                            className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                                successMessage
                                    ? "border border-sage/30 bg-sage/10 text-dark-blue"
                                    : "border border-red-200 bg-red-50 text-red-800"
                            }`}
                            role={successMessage ? "status" : "alert"}
                        >
                            {successMessage
                                ? <Send aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                                : <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={16} />}
                            <span>{successMessage || validationMessage || submitError}</span>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-navy sm:col-span-2" htmlFor="issue-title">
                            Title <span aria-hidden="true">*</span>
                            <input
                                className="mt-2 min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-title"
                                name="title"
                                onChange={handleFieldChange}
                                required
                                value={form.title}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-navy sm:col-span-2" htmlFor="issue-description">
                            Description <span aria-hidden="true">*</span>
                            <textarea
                                className="mt-2 min-h-28 w-full rounded-xl border border-steel-blue/25 px-3 py-2 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-description"
                                name="description"
                                onChange={handleFieldChange}
                                required
                                value={form.description}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-navy" htmlFor="issue-category">
                            Category <span aria-hidden="true">*</span>
                            <input
                                className="mt-2 min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-category"
                                name="category"
                                onChange={handleFieldChange}
                                required
                                value={form.category}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-navy" htmlFor="issue-location">
                            Location description <span aria-hidden="true">*</span>
                            <input
                                className="mt-2 min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-location"
                                name="location"
                                onChange={handleFieldChange}
                                required
                                value={form.location}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-navy" htmlFor="issue-city">
                            City <span aria-hidden="true">*</span>
                            <input
                                className="mt-2 min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-city"
                                name="city"
                                onChange={handleFieldChange}
                                required
                                value={form.city}
                            />
                        </label>
                        <label className="block text-sm font-semibold text-navy" htmlFor="issue-state">
                            State (optional)
                            <input
                                className="mt-2 min-h-11 w-full rounded-xl border border-steel-blue/25 px-3 text-sm font-normal text-navy outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                                id="issue-state"
                                name="state"
                                onChange={handleFieldChange}
                                value={form.state}
                            />
                        </label>
                    </div>

                    <label className="block text-sm font-semibold text-navy" htmlFor="issue-image">
                        Image (optional)
                        <span className="mt-2 flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-steel-blue/30 px-4 py-3 text-sm font-medium text-steel-blue hover:border-sage">
                            <ImagePlus aria-hidden="true" className="text-sage" size={19} />
                            {image ? image.name : "Choose JPEG, PNG, or WebP (up to 5 MB)"}
                        </span>
                        <input
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            id="issue-image"
                            onChange={handleImageChange}
                            ref={imageInputRef}
                            type="file"
                        />
                    </label>
                    {previewUrl && (
                        <div className="relative inline-block">
                            <img alt="Preview of issue report image" className="max-h-64 rounded-xl border border-navy/10 object-contain" src={previewUrl} />
                            <button
                                aria-label="Remove selected image"
                                className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-navy text-white shadow"
                                onClick={() => {
                                    setImage(null);
                                    setPreviewUrl("");
                                    if (imageInputRef.current) imageInputRef.current.value = "";
                                }}
                                type="button"
                            >
                                <X aria-hidden="true" size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-sm font-bold text-white hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting && <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />}
                        {submitting ? "Submitting..." : "Submit report"}
                    </button>
                </form>
            </section>

            <section aria-labelledby="my-reports-heading" className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-navy" id="my-reports-heading">My reports</h2>
                    <p className="mt-1 text-sm text-steel-blue">Reports you’ve submitted and their latest available status.</p>
                </div>
                {reportsLoading ? (
                    <LoadingState label="Loading your reports..." />
                ) : reportsError ? (
                    <ErrorState description={reportsError} onRetry={retryReports} title="Reports unavailable" />
                ) : reports.length === 0 ? (
                    <EmptyState
                        description="Reports you submit will appear here."
                        icon={FileWarning}
                        title="No reports submitted"
                    />
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {reports.map(report => {
                            const status = report.status || "UNKNOWN";
                            const createdAt = formatDate(report.created_at);
                            const reviewedAt = formatDate(report.reviewed_at);

                            return (
                                <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5" key={report.id}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-navy">{report.title}</h3>
                                            <p className="mt-1 text-sm text-steel-blue">{report.category}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || "bg-ivory text-dark-blue"}`}>
                                            {status.replaceAll("_", " ")}
                                        </span>
                                    </div>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dark-blue">{report.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-steel-blue">
                                        {report.city && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin aria-hidden="true" size={16} />
                                                {[report.location, report.city, report.state].filter(Boolean).join(", ")}
                                            </span>
                                        )}
                                        {createdAt && <span>Reported {createdAt}</span>}
                                    </div>
                                    {report.review_feedback && (
                                        <div className="mt-4 rounded-xl bg-ivory/70 px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Review feedback</p>
                                            <p className="mt-1 text-sm leading-6 text-dark-blue">{report.review_feedback}</p>
                                            {reviewedAt && <p className="mt-2 text-xs text-steel-blue">Reviewed {reviewedAt}</p>}
                                        </div>
                                    )}
                                    {report.image_url && (
                                        <a className="mt-4 inline-block" href={report.image_url} rel="noreferrer" target="_blank">
                                            <img alt={`Image for ${report.title}`} className="max-h-56 rounded-xl border border-navy/10 object-cover" loading="lazy" src={report.image_url} />
                                        </a>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default VolunteerIssuesPage;
