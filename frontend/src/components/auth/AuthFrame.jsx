import { HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

function AuthFrame({ title, description, children, wide = false }) {
    return (
        <section className="px-5 py-12 sm:px-8 sm:py-16">
            <div className={`mx-auto ${wide ? "max-w-3xl" : "max-w-lg"}`}>
                <div className="mb-7 text-center">
                    <Link
                        aria-label="ImpactLink home"
                        className="inline-flex items-center gap-2 rounded-lg text-xl font-bold tracking-tight text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                        to="/"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-navy text-ivory">
                            <HeartHandshake aria-hidden="true" size={22} />
                        </span>
                        Impact<span className="-ml-2 text-sage">Link</span>
                    </Link>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl leading-7 text-steel-blue">
                        {description}
                    </p>
                </div>
                <div className="rounded-2xl border border-navy/8 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8">
                    {children}
                </div>
            </div>
        </section>
    );
}

export default AuthFrame;
