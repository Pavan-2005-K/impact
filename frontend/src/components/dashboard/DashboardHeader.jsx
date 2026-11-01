import { Bell, ChevronDown, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
    dashboardNavigation,
    roleLabels
} from "./dashboardNavigation";

function getPageTitle(pathname, role) {
    const match = (dashboardNavigation[role] || []).find(item => item.to === pathname);
    if (match) return match.label;
    if (pathname === "/organization/pending") return "Organization approval";
    return "Dashboard";
}

function DashboardHeader({ onMenuClick }) {
    const { user, role, clearSession } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const pageTitle = getPageTitle(location.pathname, role);
    const userName = user?.fullName || user?.email || roleLabels[role] || "Account";

    const handleLogout = () => {
        clearSession();
        navigate(role === "ADMIN" ? "/admin/login" : "/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-navy/8 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    aria-label="Open navigation menu"
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-steel-blue hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage lg:hidden"
                    onClick={onMenuClick}
                    type="button"
                >
                    <Menu aria-hidden="true" size={21} />
                </button>
                <div className="min-w-0">
                    <p className="truncate text-base font-bold text-navy sm:text-lg">
                        {pageTitle}
                    </p>
                    <p className="hidden text-xs text-steel-blue sm:block">
                        ImpactLink / {roleLabels[role] || "Workspace"}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                    aria-label="Notifications are not configured"
                    className="grid size-10 cursor-not-allowed place-items-center rounded-xl text-steel-blue/60"
                    disabled
                    title="Notifications are not configured"
                    type="button"
                >
                    <Bell aria-hidden="true" size={19} />
                </button>

                <div className="relative">
                    <button
                        aria-expanded={profileOpen}
                        aria-haspopup="menu"
                        className="flex min-h-10 items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage sm:gap-3 sm:px-2"
                        onClick={() => setProfileOpen(open => !open)}
                        type="button"
                    >
                        <span className="grid size-9 place-items-center rounded-full bg-dark-blue text-sm font-bold text-ivory">
                            {(userName[0] || "U").toUpperCase()}
                        </span>
                        <span className="hidden min-w-0 sm:block">
                            <span className="block max-w-36 truncate text-sm font-semibold text-navy">
                                {userName}
                            </span>
                            <span className="mt-0.5 block text-xs text-steel-blue">
                                {roleLabels[role] || "Member"}
                            </span>
                        </span>
                        <ChevronDown aria-hidden="true" className="hidden text-steel-blue sm:block" size={16} />
                    </button>

                    {profileOpen && (
                        <div
                            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-navy/10 bg-white p-2 shadow-xl shadow-navy/10"
                            role="menu"
                        >
                            <div className="border-b border-navy/8 px-3 py-2.5">
                                <p className="truncate text-sm font-semibold text-navy">{userName}</p>
                                <p className="mt-0.5 text-xs text-steel-blue">{roleLabels[role]}</p>
                            </div>
                            <button
                                className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-sage"
                                onClick={handleLogout}
                                role="menuitem"
                                type="button"
                            >
                                <UserRound aria-hidden="true" className="mr-2" size={17} />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default DashboardHeader;
