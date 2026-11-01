import { HeartHandshake, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
    dashboardNavigation,
    roleIcons,
    roleLabels,
    roleHomePaths
} from "./dashboardNavigation";

function DashboardSidebar({ role, open, onClose }) {
    const navigation = dashboardNavigation[role] || [];
    const RoleIcon = roleIcons[role] || HeartHandshake;

    return (
        <>
            <button
                aria-label="Close navigation menu"
                className={`fixed inset-0 z-40 bg-navy/45 transition-opacity lg:hidden ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                type="button"
            />
            <aside
                aria-label={`${roleLabels[role] || "User"} dashboard navigation`}
                aria-modal={open ? "true" : undefined}
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col bg-navy text-ivory shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
                    open ? "visible translate-x-0" : "invisible -translate-x-full lg:visible"
                }`}
                role={open ? "dialog" : undefined}
            >
                <div className="flex h-[4.5rem] items-center justify-between border-b border-white/10 px-5">
                    <NavLink
                        aria-label="ImpactLink dashboard home"
                        className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-beige"
                        onClick={onClose}
                        to={roleHomePaths[role] || "/"}
                    >
                        <span className="grid size-9 place-items-center rounded-xl bg-sage text-white">
                            <HeartHandshake aria-hidden="true" size={21} />
                        </span>
                        <span className="text-lg font-bold tracking-tight">
                            Impact<span className="text-warm-beige">Link</span>
                        </span>
                    </NavLink>
                    <button
                        aria-label="Close navigation menu"
                        className="grid size-9 place-items-center rounded-lg text-ivory/75 hover:bg-white/10 lg:hidden"
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden="true" size={20} />
                    </button>
                </div>

                <div className="border-b border-white/10 px-5 py-5">
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-warm-beige">
                            <RoleIcon aria-hidden="true" size={20} />
                        </span>
                        <div>
                            <p className="text-xs text-ivory/55">Workspace</p>
                            <p className="mt-0.5 text-sm font-semibold">
                                {roleLabels[role] || "ImpactLink"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav aria-label="Dashboard sections" className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ivory/45">
                        Menu
                    </p>
                    <ul className="space-y-1">
                        {navigation.map(({ label, to, icon: Icon }) => (
                            <li key={to}>
                                <NavLink
                                    className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-beige ${
                                        isActive
                                            ? "bg-sage text-white shadow-sm"
                                            : "text-ivory/70 hover:bg-white/8 hover:text-white"
                                    }`}
                                    end={to.endsWith("/dashboard")}
                                    onClick={onClose}
                                    to={to}
                                >
                                    <Icon aria-hidden="true" className="shrink-0" size={18} />
                                    <span>{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="border-t border-white/10 px-5 py-4">
                    <p className="text-xs leading-5 text-ivory/50">
                        Connect with your community and make a difference.
                    </p>
                </div>
            </aside>
        </>
    );
}

export default DashboardSidebar;
