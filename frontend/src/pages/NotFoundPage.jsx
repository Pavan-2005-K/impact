import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">
                Page not found
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-navy">
                Let’s get you back on track.
            </h1>
            <Link
                className="mt-7 inline-flex rounded-xl bg-sage px-5 py-3 font-semibold text-white hover:bg-sage/90"
                to="/"
            >
                Return home
            </Link>
        </section>
    );
}

export default NotFoundPage;
