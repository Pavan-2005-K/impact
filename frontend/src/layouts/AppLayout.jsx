import { ArrowUpRight, HeartHandshake } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";

const footerLinks = [
    { label: "Home", to: "/" },
    { label: "Explore Campaigns", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Login", to: "/login" }
];

function AppLayout() {
    return (
        <div className="min-h-screen bg-ivory">
            <AppHeader />
            <main>
                <Outlet />
            </main>
            <footer className="bg-navy text-ivory" id="site-footer">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
                    <div className="max-w-sm">
                        <Link
                            className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-beige"
                            to="/"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-sage text-white">
                                <HeartHandshake aria-hidden="true" size={22} />
                            </span>
                            <span className="text-xl font-bold tracking-tight">
                                Impact<span className="text-warm-beige">Link</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-sm leading-6 text-ivory/65">
                            Connecting volunteers and organizations to make positive
                            social and environmental change in their communities.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-white">Explore</h2>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.map(({ label, to, href }) => (
                                <li key={label}>
                                    {to ? (
                                        <Link
                                            className="text-sm text-ivory/65 transition hover:text-white"
                                            to={to}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <a
                                            className="text-sm text-ivory/65 transition hover:text-white"
                                            href={href}
                                        >
                                            {label}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-white">Join ImpactLink</h2>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <Link
                                    className="text-sm text-ivory/65 transition hover:text-white"
                                    to="/register/volunteer"
                                >
                                    Volunteer registration
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-sm text-ivory/65 transition hover:text-white"
                                    to="/register/organization"
                                >
                                    Organization registration
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="inline-flex items-center gap-1.5 text-sm text-warm-beige transition hover:text-white"
                                    to="/admin/login"
                                >
                                    Admin Portal
                                    <ArrowUpRight aria-hidden="true" size={14} />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-ivory/50 sm:px-8">
                        © ImpactLink. Building stronger communities, together.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default AppLayout;
