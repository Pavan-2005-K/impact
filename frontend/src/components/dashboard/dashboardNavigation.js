import {
    BadgeCheck,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    ClipboardCheck,
    ClipboardList,
    FileWarning,
    FolderKanban,
    Handshake,
    LayoutDashboard,
    Settings,
    Sparkles,
    UsersRound
} from "lucide-react";

export const dashboardNavigation = {
    VOLUNTEER: [
        { label: "Dashboard", to: "/volunteer/dashboard", icon: LayoutDashboard },
        { label: "Explore Campaigns", to: "/volunteer/campaigns", icon: Sparkles },
        { label: "AI Recommendations", to: "/volunteer/recommendations", icon: Sparkles },
        { label: "My Applications", to: "/volunteer/applications", icon: ClipboardList },
        { label: "My Groups", to: "/volunteer/groups", icon: UsersRound },
        { label: "My Tasks", to: "/volunteer/tasks", icon: ClipboardCheck },
        { label: "Issue Reports", to: "/volunteer/issues", icon: FileWarning },
        { label: "Profile", to: "/volunteer/profile", icon: BadgeCheck }
    ],
    ORGANIZATION: [
        { label: "Dashboard", to: "/organization/dashboard", icon: LayoutDashboard },
        { label: "My Campaigns", to: "/organization/campaigns", icon: FolderKanban },
        { label: "Applications", to: "/organization/applications", icon: ClipboardList },
        { label: "Volunteer Matching", to: "/organization/matching", icon: Sparkles },
        { label: "Groups", to: "/organization/groups", icon: UsersRound },
        { label: "Tasks", to: "/organization/tasks", icon: ClipboardCheck },
        { label: "Community Reports", to: "/organization/reports", icon: FileWarning },
        { label: "Organization Profile", to: "/organization/profile", icon: BriefcaseBusiness }
    ],
    ADMIN: [
        { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Organizations", to: "/admin/organizations", icon: BriefcaseBusiness },
        { label: "Campaigns", to: "/admin/campaigns", icon: FolderKanban },
        { label: "Issue Reports", to: "/admin/issues", icon: FileWarning },
        { label: "Users", to: "/admin/users", icon: UsersRound },
        { label: "Settings", to: "/admin/settings", icon: Settings }
    ]
};

export const roleLabels = {
    VOLUNTEER: "Volunteer",
    ORGANIZATION: "Organization",
    ADMIN: "Administrator"
};

export const roleHomePaths = {
    VOLUNTEER: "/volunteer/dashboard",
    ORGANIZATION: "/organization/dashboard",
    ADMIN: "/admin/dashboard"
};

export const roleIcons = {
    VOLUNTEER: Handshake,
    ORGANIZATION: BriefcaseBusiness,
    ADMIN: ChartNoAxesCombined
};
