import { HeartHandshake, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function AppHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-navy/8 bg-ivory/95 text-navy backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                <Link
                    className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                    to="/"
                    aria-label="ImpactLink home"
                    onClick={closeMenu}
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-navy text-ivory">
                        <HeartHandshake aria-hidden="true" size={23} />
                    </span>
                    <span className="text-xl font-bold tracking-tight">
                        Impact<span className="text-sage">Link</span>
                    </span>
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
                    <Link
                        className="text-sm font-medium text-dark-blue/75 transition hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                        to="/"
                    >
                        Home
                    </Link>
                    <a
                        className="text-sm font-medium text-dark-blue/75 transition hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                        href="#how-it-works"
                    >
                        Explore Campaigns
                    </a>
                    <a
                        className="text-sm font-medium text-dark-blue/75 transition hover:text-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                        href="#about"
                    >
                        About
                    </a>
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <Link
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                        to="/login"
                    >
                        Login
                    </Link>
                    <Link
                        className="rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                        to="/register"
                    >
                        Get Started
                    </Link>
                </div>

                <button
                    aria-controls="mobile-navigation"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    className="grid size-10 place-items-center rounded-xl text-navy transition hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage lg:hidden"
                    onClick={() => setMenuOpen(open => !open)}
                    type="button"
                >
                    {menuOpen
                        ? <X aria-hidden="true" size={22} />
                        : <Menu aria-hidden="true" size={22} />}
                </button>
            </div>

            {menuOpen && (
                <nav
                    aria-label="Mobile navigation"
                    className="border-t border-navy/10 bg-ivory px-5 pb-5 pt-3 lg:hidden"
                    id="mobile-navigation"
                >
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        <Link
                            className="rounded-lg px-3 py-3 text-sm font-medium text-dark-blue hover:bg-navy/5"
                            to="/"
                            onClick={closeMenu}
                        >
                            Home
                        </Link>
                        <a
                            className="rounded-lg px-3 py-3 text-sm font-medium text-dark-blue hover:bg-navy/5"
                            href="#how-it-works"
                            onClick={closeMenu}
                        >
                            Explore Campaigns
                        </a>
                        <a
                            className="rounded-lg px-3 py-3 text-sm font-medium text-dark-blue hover:bg-navy/5"
                            href="#about"
                            onClick={closeMenu}
                        >
                            About
                        </a>
                        <div className="mt-2 flex gap-3 border-t border-navy/10 pt-4">
                            <Link
                                className="flex-1 rounded-xl border border-navy/15 px-4 py-3 text-center text-sm font-semibold text-navy"
                                to="/login"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>
                            <Link
                                className="flex-1 rounded-xl bg-sage px-4 py-3 text-center text-sm font-semibold text-white"
                                to="/register"
                                onClick={closeMenu}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
}

export default AppHeader;
