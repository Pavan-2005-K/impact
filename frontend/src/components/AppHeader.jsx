import { HeartHandshake, Menu } from "lucide-react";
import { Link } from "react-router-dom";

function AppHeader() {
    return (
        <header className="bg-navy text-ivory">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                <Link
                    className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-beige"
                    to="/"
                    aria-label="ImpactLink home"
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-sage text-white">
                        <HeartHandshake aria-hidden="true" size={23} />
                    </span>
                    <span className="text-xl font-semibold tracking-tight">
                        Impact<span className="text-warm-beige">Link</span>
                    </span>
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-8 sm:flex">
                    <a className="text-sm text-ivory/75 transition hover:text-white" href="#mission">
                        Our mission
                    </a>
                    <a className="text-sm text-ivory/75 transition hover:text-white" href="#roles">
                        Who it’s for
                    </a>
                </nav>

                <span className="hidden rounded-full border border-ivory/20 px-3 py-1.5 text-xs font-medium text-ivory/75 sm:inline-flex">
                    Community impact, together
                </span>
                <span className="sm:hidden" aria-hidden="true">
                    <Menu size={23} />
                </span>
            </div>
        </header>
    );
}

export default AppHeader;
