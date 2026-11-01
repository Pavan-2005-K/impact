export function getRoleHomePath(user) {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "ORGANIZATION") {
        return user.approvalStatus === "APPROVED"
            ? "/organization/dashboard"
            : "/organization/pending";
    }
    if (user?.role === "VOLUNTEER") return "/volunteer/dashboard";
    return "/";
}
