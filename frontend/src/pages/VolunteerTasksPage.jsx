import { CalendarDays, ClipboardCheck, ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { getMyTasks, submitTaskEvidence } from "../services/taskApi";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumImageSize = 5 * 1024 * 1024;
const taskStatusStyles = {
    PENDING: "bg-warm-beige/45 text-dark-blue",
    IN_PROGRESS: "bg-steel-blue/10 text-steel-blue",
    REJECTED: "bg-red-100 text-red-800",
    SUBMITTED: "bg-warm-beige/45 text-dark-blue",
    VERIFIED: "bg-sage/15 text-sage"
};

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function TaskCard({ task, onRefresh, onUnauthorized }) {
    const [submissionNotes, setSubmissionNotes] = useState("");
    const [afterImage, setAfterImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const status = task.status || "UNKNOWN";
    const canSubmit = ["PENDING", "IN_PROGRESS", "REJECTED"].includes(status);
    const dueDate = formatDate(task.due_date);
    const submittedAt = formatDate(task.submitted_at);
    const verifiedAt = formatDate(task.verified_at);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const handleFileChange = event => {
        const selectedFile = event.target.files?.[0] || null;
        setErrorMessage("");
        setValidationMessage("");
        setAfterImage(null);
        setPreviewUrl("");
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
        setAfterImage(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        if (submitting) return;
        setValidationMessage("");
        setErrorMessage("");
        setSuccessMessage("");
        if (!submissionNotes.trim()) {
            setValidationMessage("Completion notes are required.");
            return;
        }
        if (!["PENDING", "IN_PROGRESS", "REJECTED"].includes(status)) {
            setValidationMessage("This task cannot be submitted in its current status.");
            return;
        }
        if (!afterImage) {
            setValidationMessage("Choose an after-completion image.");
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitTaskEvidence(task.id, submissionNotes.trim(), afterImage);
            setSuccessMessage(result.message || "Task evidence submitted.");
            setSubmissionNotes("");
            setAfterImage(null);
            setPreviewUrl("");
            await onRefresh();
        } catch (error) {
            if (error.response?.status === 401 ||
                (error.response?.status === 403 &&
                    error.response?.data?.message === "Invalid or expired token")) {
                onUnauthorized();
                return;
            }
            setErrorMessage(typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : "We couldn’t submit the task evidence. Check the image and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-navy">{task.title || "Task"}</h2>
                    {task.campaign_title && (
                        <p className="mt-1 text-sm text-steel-blue">{task.campaign_title}</p>
                    )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${taskStatusStyles[status] || "bg-ivory text-dark-blue"}`}>
                    {status.replaceAll("_", " ")}
                </span>
            </div>

            {task.description && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-dark-blue">
                    {task.description}
                </p>
            )}

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-steel-blue">
                {task.group_name && <div><dt className="inline">Group: </dt><dd className="inline font-medium text-navy">{task.group_name}</dd></div>}
                {dueDate && (
                    <div className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" size={16} />
                        <dt className="sr-only">Due date</dt>
                        <dd>Due {dueDate}</dd>
                    </div>
                )}
            </dl>

            {task.submission_notes && (
                <div className="mt-5 rounded-xl bg-ivory/70 p-4">
                    <h3 className="text-sm font-bold text-navy">Submitted completion notes</h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-dark-blue">{task.submission_notes}</p>
                    {submittedAt && <p className="mt-2 text-xs text-steel-blue">Submitted {submittedAt}</p>}
                </div>
            )}

            {task.after_image_url && (
                <div className="mt-4">
                    <h3 className="mb-2 text-sm font-bold text-navy">Submitted after-image</h3>
                    <a href={task.after_image_url} rel="noreferrer" target="_blank">
                        <img
                            alt="Task completion evidence"
                            className="max-h-72 w-full rounded-xl border border-navy/10 object-cover sm:w-auto"
                            loading="lazy"
                            src={task.after_image_url}
                        />
                    </a>
                </div>
            )}

            {status === "SUBMITTED" && (
                <p className="mt-4 rounded-xl border border-warm-beige/70 bg-warm-beige/20 px-4 py-3 text-sm text-dark-blue" role="status">
                    Your evidence is waiting for organization verification.
                </p>
            )}
            {task.verification_feedback && (
                <div className="mt-4 rounded-xl border border-steel-blue/15 bg-ivory/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Organization feedback</p>
                    <p className="mt-1 text-sm leading-6 text-dark-blue">{task.verification_feedback}</p>
                    {verifiedAt && <p className="mt-2 text-xs text-steel-blue">Reviewed {verifiedAt}</p>}
                </div>
            )}

            {canSubmit && (
                <form className="mt-5 border-t border-navy/8 pt-5" onSubmit={handleSubmit}>
                    <h3 className="font-bold text-navy">
                        {status === "REJECTED" ? "Resubmit task evidence" : "Submit task evidence"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-steel-blue">
                        Only the assigned group leader can submit. Add completion notes and one after-image (JPEG, PNG, or WebP, up to 5 MB).
                    </p>

                    {(validationMessage || errorMessage || successMessage) && (
                        <p
                            aria-live="polite"
                            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                                successMessage
                                    ? "border border-sage/30 bg-sage/10 text-dark-blue"
                                    : "border border-red-200 bg-red-50 text-red-800"
                            }`}
                            role={successMessage ? "status" : "alert"}
                        >
                            {successMessage || validationMessage || errorMessage}
                        </p>
                    )}

                    <label className="mt-4 block text-sm font-semibold text-navy" htmlFor={`task-notes-${task.id}`}>
                        Completion notes
                        <textarea
                            className="mt-2 min-h-28 w-full rounded-xl border border-steel-blue/25 px-3 py-2 text-sm font-normal text-navy outline-none placeholder:text-steel-blue/70 focus:border-sage focus:ring-2 focus:ring-sage/20"
                            id={`task-notes-${task.id}`}
                            onChange={event => setSubmissionNotes(event.target.value)}
                            placeholder="Describe the completed work"
                            required
                            value={submissionNotes}
                        />
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-navy" htmlFor={`task-image-${task.id}`}>
                        After-completion image
                        <span className="mt-2 flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-steel-blue/30 px-4 py-3 text-sm font-medium text-steel-blue hover:border-sage">
                            <ImagePlus aria-hidden="true" className="text-sage" size={19} />
                            {afterImage ? afterImage.name : "Choose an image"}
                        </span>
                        <input
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            id={`task-image-${task.id}`}
                            onChange={handleFileChange}
                            required={!afterImage}
                            type="file"
                        />
                    </label>

                    {previewUrl && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-blue">Image preview</p>
                            <img alt="Preview of task completion evidence" className="max-h-72 rounded-xl border border-navy/10 object-contain" src={previewUrl} />
                        </div>
                    )}

                    <button
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-sm font-bold text-white hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting
                            ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
                            : <UploadCloud aria-hidden="true" size={17} />}
                        {submitting ? "Uploading..." : "Submit evidence"}
                    </button>
                </form>
            )}
        </article>
    );
}

function VolunteerTasksPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const handleUnauthorized = useCallback(() => {
        clearSession();
        navigate("/login", { replace: true });
    }, [clearSession, navigate]);

    const loadTasks = useCallback(async signal => {
        try {
            const result = await getMyTasks(signal);
            setTasks(Array.isArray(result?.tasks) ? result.tasks : []);
            setErrorMessage("");
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
                : "We couldn’t load your tasks. Please try again.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [clearSession, navigate]);

    const retry = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadTasks(controller.signal);
        });
        return () => controller.abort();
    }, [loadTasks]);

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "My Tasks"]}
                description="Review tasks assigned to your group and submit completion evidence when eligible."
                title="My Tasks"
            />
            {loading ? (
                <LoadingState label="Loading your tasks..." />
            ) : errorMessage ? (
                <ErrorState description={errorMessage} onRetry={retry} title="Tasks unavailable" />
            ) : tasks.length === 0 ? (
                <EmptyState
                    action={<Link className="font-semibold text-sage hover:underline" to="/volunteer/groups">View my groups</Link>}
                    description="Tasks appear here when an organization assigns them to a group you lead. Only the assigned group leader can view and submit these tasks."
                    icon={ClipboardCheck}
                    title="No leader-assigned tasks"
                />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm font-medium text-steel-blue">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                    </p>
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            onRefresh={() => loadTasks()}
                            onUnauthorized={handleUnauthorized}
                            task={task}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default VolunteerTasksPage;
