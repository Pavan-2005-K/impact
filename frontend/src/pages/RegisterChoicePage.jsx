import { ArrowRight, BriefcaseBusiness, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";

const choices = [
    {
        title: "Join as a volunteer",
        description: "Share your skills and find community campaigns that matter to you.",
        icon: HeartHandshake,
        to: "/register/volunteer"
    },
    {
        title: "Register your organization",
        description: "Bring your campaigns to a community ready to make a difference.",
        icon: BriefcaseBusiness,
        to: "/register/organization"
    }
];

function RegisterChoicePage() {
    return (
        <AuthFrame
            description="Choose how you’d like to take part. You can always learn more before creating an account."
            title="Get started with ImpactLink"
        >
            <div className="space-y-4">
                {choices.map(({ title, description, icon: Icon, to }) => (
                    <Link
                        className="group flex items-center gap-4 rounded-2xl border border-navy/10 p-4 transition hover:border-sage/60 hover:bg-ivory/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage sm:p-5"
                        key={to}
                        to={to}
                    >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ivory text-sage">
                            <Icon aria-hidden="true" size={23} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-bold text-navy">{title}</span>
                            <span className="mt-1 block text-sm leading-6 text-steel-blue">
                                {description}
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="shrink-0 text-sage transition group-hover:translate-x-1"
                            size={19}
                        />
                    </Link>
                ))}
            </div>
            <p className="mt-6 text-center text-sm text-steel-blue">
                Already part of the community?{" "}
                <Link className="font-semibold text-sage hover:underline" to="/login">
                    Log in
                </Link>
            </p>
        </AuthFrame>
    );
}

export default RegisterChoicePage;
