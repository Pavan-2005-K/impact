import {
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    Bot,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Compass,
    HeartHandshake,
    MapPin,
    Megaphone,
    Sprout,
    UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";
import communityIllustration from "../assets/community-hero.svg";

const steps = [
    {
        number: "01",
        title: "Discover campaigns",
        description: "Explore community initiatives that fit your interests and skills.",
        icon: Compass
    },
    {
        number: "02",
        title: "Connect with a community",
        description: "Meet organizations and volunteers who care about the same causes.",
        icon: UsersRound
    },
    {
        number: "03",
        title: "Make an impact",
        description: "Take part, work together, and help move meaningful projects forward.",
        icon: Sprout
    }
];

const features = [
    {
        title: "AI-powered volunteer matching",
        description: "Discover opportunities aligned with volunteer skills, availability, and interests.",
        icon: Bot
    },
    {
        title: "Campaign management",
        description: "Give organizations a clear place to create and coordinate community campaigns.",
        icon: Megaphone
    },
    {
        title: "Volunteer coordination",
        description: "Bring people together in groups and make it easier to collaborate.",
        icon: HeartHandshake
    },
    {
        title: "Task tracking and verification",
        description: "Follow campaign tasks from assignment through evidence and review.",
        icon: ClipboardCheck
    },
    {
        title: "Community issue reporting",
        description: "Help communities share local concerns and bring them into view.",
        icon: MapPin
    },
    {
        title: "Impact tracking",
        description: "Keep campaign activity and progress visible to the people involved.",
        icon: ClipboardList
    }
];

function HomePage() {
    return (
        <>
            <section
                aria-labelledby="hero-title"
                className="relative overflow-hidden bg-ivory"
                id="home"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-36 -top-32 size-[30rem] rounded-full border border-warm-beige/60"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-8 size-[21rem] rounded-full border border-warm-beige/50"
                />
                <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:py-24">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-sage/25 bg-white/70 px-4 py-2 text-sm font-semibold text-sage">
                            <span className="size-2 rounded-full bg-sage" />
                            Good work grows together
                        </span>
                        <h1
                            className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-navy sm:text-5xl lg:text-6xl"
                            id="hero-title"
                        >
                            Together, We Create{" "}
                            <span className="text-sage">Meaningful Change.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-steel-blue">
                            ImpactLink connects volunteers with organizations to make
                            social and environmental campaigns easier to find, organize,
                            and grow.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sage px-6 py-3 font-semibold text-white shadow-lg shadow-sage/20 transition hover:-translate-y-0.5 hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-navy"
                                to="/register"
                            >
                                Get Started
                                <ArrowRight aria-hidden="true" size={18} />
                            </Link>
                            <Link
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white/60 px-6 py-3 font-semibold text-navy transition hover:border-sage hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sage"
                                to="/#how-it-works"
                            >
                                Explore Campaigns
                                <ArrowDown aria-hidden="true" size={17} />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-sm text-steel-blue">
                            <CheckCircle2 aria-hidden="true" className="text-sage" size={18} />
                            <span>A welcoming space for people ready to make a difference.</span>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-xl lg:-mr-5">
                        <div className="absolute inset-8 rounded-[2.5rem] bg-warm-beige/45 blur-2xl" />
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#e8e4cf] shadow-2xl shadow-navy/10">
                            <img
                                alt="Illustration of community members working together around a growing tree"
                                className="block h-auto w-full"
                                fetchPriority="high"
                                src={communityIllustration}
                            />
                            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:right-6">
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ivory text-sage">
                                    <HeartHandshake aria-hidden="true" size={23} />
                                </span>
                                <div>
                                    <p className="font-semibold text-navy">Many hands, shared purpose</p>
                                    <p className="mt-0.5 text-sm text-steel-blue">
                                        A stronger community starts with connection.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="how-title"
                className="bg-white py-16 sm:py-20"
                id="how-it-works"
            >
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-[0.18em] text-sage">
                            Simple by design
                        </span>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl" id="how-title">
                            How ImpactLink works
                        </h2>
                        <p className="mt-4 leading-7 text-steel-blue">
                            A few clear steps can turn good intentions into shared action.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {steps.map(({ number, title, description, icon: Icon }) => (
                            <article
                                className="relative rounded-2xl border border-navy/8 bg-ivory/45 p-6 sm:p-7"
                                key={number}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold tracking-widest text-sage">
                                        {number}
                                    </span>
                                    <span className="grid size-12 place-items-center rounded-xl bg-white text-sage shadow-sm">
                                        <Icon aria-hidden="true" size={23} />
                                    </span>
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-navy">{title}</h3>
                                <p className="mt-3 leading-7 text-steel-blue">{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="features-title"
                className="bg-ivory py-16 sm:py-20"
                id="features"
            >
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div className="max-w-2xl">
                            <span className="text-sm font-bold uppercase tracking-[0.18em] text-sage">
                                Built for community work
                            </span>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl" id="features-title">
                                Everything in one connected place
                            </h2>
                        </div>
                        <p className="max-w-md leading-7 text-steel-blue">
                            Tools that help people coordinate with clarity—from the first
                            campaign idea to the work happening on the ground.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ title, description, icon: Icon }) => (
                            <article
                                className="rounded-2xl border border-navy/5 bg-white p-6 shadow-sm shadow-navy/5 transition hover:-translate-y-1 hover:shadow-md"
                                key={title}
                            >
                                <span className="grid size-12 place-items-center rounded-xl bg-ivory text-sage">
                                    <Icon aria-hidden="true" size={23} />
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                                <p className="mt-2 leading-7 text-steel-blue">{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="about-title"
                className="bg-white py-16 sm:py-20"
                id="about"
            >
                <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                    <div className="flex items-center justify-center">
                        <div className="grid size-48 place-items-center rounded-full bg-ivory sm:size-56">
                            <div className="grid size-32 place-items-center rounded-full bg-sage text-white shadow-lg shadow-sage/20 sm:size-40">
                                <HeartHandshake aria-hidden="true" size={68} strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    <div className="max-w-2xl">
                        <span className="text-sm font-bold uppercase tracking-[0.18em] text-sage">
                            About ImpactLink
                        </span>
                        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl" id="about-title">
                            A better way to bring good people and good ideas together.
                        </h2>
                        <p className="mt-5 leading-7 text-steel-blue">
                            Meaningful community work takes coordination, care, and
                            people willing to show up. ImpactLink gives volunteers and
                            organizations a shared place to connect around campaigns and
                            make positive social and environmental impact.
                        </p>
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="join-title"
                className="bg-dark-blue px-5 py-16 text-ivory sm:px-8 sm:py-20"
                id="join"
            >
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                        <span className="text-sm font-bold uppercase tracking-[0.18em] text-warm-beige">
                            Your community needs you
                        </span>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl" id="join-title">
                            Ready to make a difference together?
                        </h2>
                        <p className="mt-4 leading-7 text-ivory/70">
                            Join as a volunteer or bring your organization’s next campaign
                            to the community.
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Link
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-warm-beige"
                            to="/register/volunteer"
                        >
                            Join as a Volunteer
                            <ArrowRight aria-hidden="true" size={17} />
                        </Link>
                        <Link
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ivory/25 px-5 py-3 font-semibold text-ivory transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-warm-beige"
                            to="/register/organization"
                        >
                            Register Organization
                            <ArrowUpRight aria-hidden="true" size={17} />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default HomePage;
