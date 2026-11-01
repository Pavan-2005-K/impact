import EmptyState from "../components/dashboard/EmptyState";
import PageHeader from "../components/dashboard/PageHeader";
import { dashboardNavigation, roleLabels } from "../components/dashboard/dashboardNavigation";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";

function DashboardSectionPlaceholder() {
    const { role } = useAuth();
    const location = useLocation();
    const section = (dashboardNavigation[role] || []).find(item => item.to === location.pathname);
    const title = section?.label || "Dashboard";

    return (
        <>
            <PageHeader
                breadcrumb={["Workspace", roleLabels[role] || "Dashboard", title]}
                description={`${title} tools for your ${roleLabels[role]?.toLowerCase() || "ImpactLink"} workspace.`}
                title={title}
            />
            <EmptyState
                description="This section will be available when its features are implemented. No sample data is shown."
                title={`${title} is coming in a later phase`}
            />
        </>
    );
}

export default DashboardSectionPlaceholder;
