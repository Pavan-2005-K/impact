import { ArrowRight, CalendarDays, HeartHandshake, MapPin, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDates(startDate, endDate) {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start && end) return `${start} – ${end}`;
    return start || end;
}

function getLocation(campaign) {
    const locationParts = [campaign.city, campaign.state]
        .filter(value => typeof value === "string" && value.trim());
    if (locationParts.length) return locationParts.join(", ");
    return typeof campaign.location === "string" && campaign.location.trim()
        ? campaign.location
        : null;
}

function CampaignCard({ item }) {
    const campaign = item.campaign;
    const dates = formatDates(campaign.start_date, campaign.end_date);
    const location = getLocation(campaign);
    const hasMatchScore = item.matchScore != null && Number.isFinite(Number(item.matchScore));
    const skills = Array.isArray(campaign.skills)
        ? campaign.skills.map(skill => skill?.name).filter(Boolean)
        : [];

    return (
        <article className="flex h-full flex-col rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="mb-3 grid size-10 place-items-center rounded-xl bg-ivory text-sage">
                        <HeartHandshake aria-hidden="true" size={20} />
                    </span>
                    {campaign.category && (
                        <span className="inline-flex rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">
                            {campaign.category}
                        </span>
                    )}
                    <h2 className="mt-3 text-lg font-bold leading-snug text-navy">
                        {campaign.title || "Untitled campaign"}
                    </h2>
                </div>
                {hasMatchScore && (
                    <span
                        aria-label={`${item.matchScore}% match`}
                        className="shrink-0 rounded-xl bg-ivory px-3 py-2 text-sm font-bold text-dark-blue"
                    >
                        {item.matchScore}% match
                    </span>
                )}
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-steel-blue">
                {campaign.description || "No description provided."}
            </p>

            <dl className="mt-5 grid gap-3 text-sm text-dark-blue">
                {location && (
                    <div className="flex items-start gap-2">
                        <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={17} />
                        <dd>{location}</dd>
                    </div>
                )}
                {dates && (
                    <div className="flex items-start gap-2">
                        <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={17} />
                        <dd>{dates}</dd>
                    </div>
                )}
                {(campaign.required_volunteers != null || campaign.max_volunteers != null) && (
                    <div className="flex items-start gap-2">
                        <UsersRound aria-hidden="true" className="mt-0.5 shrink-0 text-sage" size={17} />
                        <dd>
                            {campaign.required_volunteers != null
                                ? `${campaign.required_volunteers} required`
                                : "Volunteer opportunity"}
                            {campaign.max_volunteers != null
                                ? ` · Up to ${campaign.max_volunteers}`
                                : ""}
                        </dd>
                    </div>
                )}
            </dl>

            {skills.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-steel-blue">
                        Required skills
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <li
                                className="rounded-full border border-steel-blue/15 px-2.5 py-1 text-xs text-dark-blue"
                                key={`${skill}-${index}`}
                            >
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {campaign.status && (
                <p className="mt-4 text-xs text-steel-blue">
                    Status: <span className="font-semibold text-dark-blue">{campaign.status}</span>
                </p>
            )}

            <Link
                className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                to={`/volunteer/campaigns/${encodeURIComponent(campaign.id)}`}
            >
                View details
                <ArrowRight aria-hidden="true" size={16} />
            </Link>
        </article>
    );
}

export default CampaignCard;
