import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath } from "./roleRoutes";

function ProtectedRoute({ allowedRole, approvedOrganizationOnly = false }) {
    const { session, role, user } = useAuth();
    const location = useLocation();

    if (!session?.token || !role) {
        return (
            <Navigate
                replace
                state={{ from: location }}
                to={allowedRole === "ADMIN" ? "/admin/login" : "/login"}
            />
        );
    }

    if (role !== allowedRole) {
        return <Navigate replace to={getRoleHomePath(user)} />;
    }

    if (
        approvedOrganizationOnly &&
        (role !== "ORGANIZATION" || user.approvalStatus !== "APPROVED")
    ) {
        return <Navigate replace to="/organization/pending" />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
