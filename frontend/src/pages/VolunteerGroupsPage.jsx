import { CalendarDays, Crown, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";
import LoadingState from "../components/dashboard/LoadingState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";
import { getMyGroups } from "../services/groupApi";

function VolunteerGroupsPage() {
    const { clearSession } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadGroups = useCallback(async signal => {
        try {
            const result = await getMyGroups(signal);
            setGroups(Array.isArray(result?.groups) ? result.groups : []);
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
                : "We couldn’t load your groups. Please try again.");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [clearSession, navigate]);

    const retry = useCallback(() => {
        setLoading(true);
        setErrorMessage("");
        loadGroups();
    }, [loadGroups]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) loadGroups(controller.signal);
        });
        return () => controller.abort();
    }, [loadGroups]);

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "My Groups"]}
                description="See the campaign groups you’ve been assigned to and your group role."
                title="My Groups"
            />

            {loading ? (
                <LoadingState label="Loading your groups..." />
            ) : errorMessage ? (
                <ErrorState description={errorMessage} onRetry={retry} title="Groups unavailable" />
            ) : groups.length === 0 ? (
                <EmptyState
                    action={<Link className="font-semibold text-sage hover:underline" to="/volunteer/campaigns">Explore campaigns</Link>}
                    description="When an organization assigns you to a campaign group, it will appear here."
                    icon={UsersRound}
                    title="No group assigned yet"
                />
            ) : (
                <>
                    <p className="text-sm font-medium text-steel-blue">
                        {groups.length} {groups.length === 1 ? "group" : "groups"}
                    </p>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {groups.map(group => (
                            <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5" key={group.group_id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-sage">Group</p>
                                        <h2 className="mt-1 text-lg font-bold text-navy">
                                            {group.group_name || "Group"}
                                        </h2>
                                    </div>
                                    {group.is_group_leader && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-beige/45 px-3 py-1 text-xs font-bold text-dark-blue">
                                            <Crown aria-hidden="true" size={14} />
                                            You’re the group leader
                                        </span>
                                    )}
                                </div>

                                <dl className="mt-5 space-y-4 border-t border-navy/8 pt-4">
                                    {group.campaign_title && (
                                        <div className="flex items-start gap-3">
                                            <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={18} />
                                            <div>
                                                <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Campaign</dt>
                                                <dd className="mt-1 text-sm font-medium text-navy">{group.campaign_title}</dd>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <UsersRound aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={18} />
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">Group leader</dt>
                                            <dd className="mt-1 text-sm font-medium text-navy">
                                                {group.leader_name || (group.leader_id ? "Leader assigned" : "Not assigned")}
                                            </dd>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-ivory/70 px-4 py-3 text-sm leading-6 text-steel-blue">
                                        Member details aren’t included in the volunteer group response.
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default VolunteerGroupsPage;
