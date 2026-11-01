import {
    ArrowDown,
    ArrowRight,
    BriefcaseBusiness,
    HeartHandshake,
    ShieldCheck,
    UsersRound
} from "lucide-react";

const roles = [
    {
        title: "Volunteer",
        description: "Find meaningful ways to share your time and skills.",
        icon: HeartHandshake
    },
    {
        title: "Organization",
        description: "Bring people together around causes that matter.",
        icon: BriefcaseBusiness
    },
    {
        title: "Administrator",
        description: "Help keep the community and its programs thriving.",
        icon: ShieldCheck
    }
];

function HomePage() {
    return (
        <>
            <section
                className="relative isolate overflow-hidden bg-navy text-ivory"
                id="mission"
            >
                <div
                    aria-hidden="true"
                    className="absolute -right-32 -top-40 size-96 rounded-full border border-ivory/10"
                />
                <div
                    aria-hidden="true"
                    className="absolute -right-12 -top-20 size-56 rounded-full border border-ivory/10"
                />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:py-32">
                    <div className="max-w-2xl">
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage/50 bg-sage/15 px-4 py-2 text-sm font-medium text-ivory">
                            <span className="size-2 rounded-full bg-sage" />
                            Good things happen when we work together
                        </span>
                        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            Turn your care for the community into{" "}
                            <span className="text-warm-beige">real impact.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-ivory/75">
                            ImpactLink connects volunteers and organizations to make
                            local campaigns easier to discover, organize, and grow.
                        </p>
                        <a
                            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-sage px-5 py-3.5 font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-warm-beige"
                            href="#roles"
                        >
                            See how you can help
                            <ArrowDown aria-hidden="true" size={18} />
                        </a>
                    </div>

                    <div className="mx-auto w-full max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-9">
                            <div className="mb-7 grid size-14 place-items-center rounded-2xl bg-warm-beige text-navy">
                                <UsersRound aria-hidden="true" size={27} />
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-warm-beige">
                                One community
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold leading-snug text-white sm:text-3xl">
                                Many hands. A lasting difference.
                            </h2>
                            <p className="mt-4 leading-7 text-ivory/70">
                                From neighborhood initiatives to larger campaigns,
                                every contribution helps move good work forward.
                            </p>
                            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-ivory/75">
                                <HeartHandshake aria-hidden="true" className="text-warm-beige" size={20} />
                                <span>Better outcomes start with connection.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20" id="roles">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">
                        A place for everyone
                    </span>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
                        Find your place in the work
                    </h2>
                    <p className="mt-4 leading-7 text-steel-blue">
                        Whether you’re here to lend a hand or lead a campaign,
                        community progress begins with people like you.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {roles.map(({ title, description, icon: Icon }) => (
                        <article
                            className="rounded-2xl border border-navy/5 bg-white p-6 shadow-sm shadow-navy/5 sm:p-7"
                            key={title}
                        >
                            <span className="grid size-12 place-items-center rounded-xl bg-ivory text-sage">
                                <Icon aria-hidden="true" size={23} />
                            </span>
                            <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
                            <p className="mt-2 min-h-12 leading-6 text-steel-blue">
                                {description}
                            </p>
                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sage">
                                ImpactLink community
                                <ArrowRight aria-hidden="true" size={16} />
                            </span>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}

export default HomePage;
