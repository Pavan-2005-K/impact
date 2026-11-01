import { CalendarClock, CircleUserRound, Info, Sparkles } from "lucide-react";
import EmptyState from "../components/dashboard/EmptyState";
import PageHeader from "../components/dashboard/PageHeader";
import { useAuth } from "../context/useAuth";

function ProfileField({ label, value }) {
    return (
        <div className="rounded-xl border border-navy/8 bg-ivory/50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-steel-blue">
                {label}
            </dt>
            <dd className="mt-1 break-words font-medium text-navy">
                {value || "Not available"}
            </dd>
        </div>
    );
}

function VolunteerProfilePage() {
    const { user } = useAuth();

    return (
        <div className="space-y-7">
            <PageHeader
                breadcrumb={["Workspace", "Volunteer", "Profile"]}
                description="Review the profile details currently available to your account."
                title="My profile"
            />

            <div
                className="flex items-start gap-3 rounded-2xl border border-steel-blue/20 bg-white p-4 text-sm leading-6 text-dark-blue shadow-sm shadow-navy/5 sm:p-5"
                role="status"
            >
                <Info aria-hidden="true" className="mt-0.5 shrink-0 text-steel-blue" size={19} />
                <p>
                    Profile details are read-only for now. Login provides your name and email, but
                    the backend does not currently provide a volunteer profile endpoint for
                    retrieving or updating the rest of your information.
                </p>
            </div>

            <section aria-labelledby="profile-information-heading">
                <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sage">
                        <CircleUserRound aria-hidden="true" size={20} />
                    </span>
                    <div>
                        <h2 className="font-bold text-navy" id="profile-information-heading">
                            Profile information
                        </h2>
                        <p className="text-sm text-steel-blue">
                            Information returned with your authenticated session.
                        </p>
                    </div>
                </div>
                <dl className="grid gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-sm shadow-navy/5 sm:grid-cols-2 sm:p-5">
                    <ProfileField label="Full name" value={user?.fullName} />
                    <ProfileField label="Email" value={user?.email} />
                </dl>
                <p className="mt-3 text-sm leading-6 text-steel-blue">
                    Phone, occupation, bio, and location are stored in the backend but are not
                    included in the login response or available through a profile API.
                </p>
            </section>

            <section aria-labelledby="skills-heading">
                <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sage">
                        <Sparkles aria-hidden="true" size={20} />
                    </span>
                    <div>
                        <h2 className="font-bold text-navy" id="skills-heading">Skills</h2>
                        <p className="text-sm text-steel-blue">Your volunteer skills</p>
                    </div>
                </div>
                <EmptyState
                    description="The database stores skill names and volunteer skill associations, but no API returns your registered skills. Names and IDs cannot be displayed reliably yet."
                    icon={Sparkles}
                    title="Skills aren’t available to view"
                />
            </section>

            <section aria-labelledby="availability-heading">
                <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-ivory text-sage">
                        <CalendarClock aria-hidden="true" size={20} />
                    </span>
                    <div>
                        <h2 className="font-bold text-navy" id="availability-heading">
                            Availability
                        </h2>
                        <p className="text-sm text-steel-blue">Your available days and times</p>
                    </div>
                </div>
                <EmptyState
                    description="Availability is stored in the database, but there is no API to retrieve or update your availability schedule."
                    icon={CalendarClock}
                    title="Availability isn’t available to view"
                />
            </section>
        </div>
    );
}

export default VolunteerProfilePage;
