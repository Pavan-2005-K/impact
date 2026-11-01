import { Clock3, LogOut } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import { useAuth } from "../context/useAuth";

function OrganizationPendingPage() {
    const { user, clearSession } = useAuth();
    const navigate = useNavigate();
    const isApproved = user?.approvalStatus === "APPROVED";
    const status = user?.approvalStatus || "PENDING";

    if (isApproved) {
        return <Navigate replace to="/organization/dashboard" />;
    }

    const handleLogout = () => {
        clearSession();
        navigate("/login", { replace: true });
    };

    return (
        <AuthFrame
            description="Your account can sign in, but campaign-management features require organization approval."
            title="Organization account status"
        >
            <div className="rounded-xl border border-warm-beige bg-ivory p-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-dark-blue">
                    <Clock3 aria-hidden="true" className="text-sage" size={17} />
                    {status === "REJECTED" ? "Approval not granted" : "Pending admin approval"}
                </span>
                <p className="mt-4 text-sm leading-6 text-steel-blue">
                    {status === "REJECTED"
                        ? "Your organization is not approved to manage campaigns. Contact the platform administrator for further information."
                        : "Thanks for registering. An administrator must approve your organization before you can manage campaigns."}
                </p>
            </div>
            <button
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-navy/15 px-5 py-3 text-sm font-semibold text-navy hover:bg-navy/5"
                onClick={handleLogout}
                type="button"
            >
                <LogOut aria-hidden="true" size={17} />
                Log out
            </button>
        </AuthFrame>
    );
}

export default OrganizationPendingPage;
