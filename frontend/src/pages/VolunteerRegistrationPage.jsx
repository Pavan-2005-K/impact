import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import { getAuthErrorMessage, registerVolunteer } from "../services/authApi";

const days = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
    "FRIDAY", "SATURDAY", "SUNDAY"
];

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    occupation: "OTHER",
    bio: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
    skillIds: "",
    availability: []
};

function VolunteerRegistrationPage() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const [registered, setRegistered] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const updateField = event => {
        const { name, value } = event.target;
        setForm(current => ({ ...current, [name]: value }));
    };

    const updateAvailability = (index, field, value) => {
        setForm(current => ({
            ...current,
            availability: current.availability.map((slot, slotIndex) =>
                slotIndex === index ? { ...slot, [field]: value } : slot
            )
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        if (loading) return;
        setErrorMessage("");
        setValidationMessage("");

        const normalizedEmail = form.email.trim();
        if (!form.fullName.trim()) {
            setValidationMessage("Full name is required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setValidationMessage("Enter a valid email address.");
            return;
        }
        if (form.password.length < 8) {
            setValidationMessage("Password must contain at least 8 characters.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setValidationMessage("The passwords do not match.");
            return;
        }

        const skillIds = form.skillIds
            .split(",")
            .map(value => value.trim())
            .filter(Boolean)
            .map(Number);
        if (skillIds.some(skillId => !Number.isInteger(skillId) || skillId < 1)) {
            setValidationMessage("Enter skill IDs as positive whole numbers, separated by commas.");
            return;
        }

        if (form.latitude && (!Number.isFinite(Number(form.latitude)) || Math.abs(Number(form.latitude)) > 90)) {
            setValidationMessage("Latitude must be a number between -90 and 90.");
            return;
        }
        if (form.longitude && (!Number.isFinite(Number(form.longitude)) || Math.abs(Number(form.longitude)) > 180)) {
            setValidationMessage("Longitude must be a number between -180 and 180.");
            return;
        }
        if (form.availability.some(slot => !slot.startTime || !slot.endTime || slot.endTime <= slot.startTime)) {
            setValidationMessage("Each availability end time must be later than its start time.");
            return;
        }

        setLoading(true);
        try {
            const result = await registerVolunteer({
                fullName: form.fullName.trim(),
                email: normalizedEmail,
                password: form.password,
                phone: form.phone.trim() || undefined,
                occupation: form.occupation,
                bio: form.bio.trim() || undefined,
                city: form.city.trim() || undefined,
                state: form.state.trim() || undefined,
                country: form.country.trim() || undefined,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                skills: skillIds,
                availability: form.availability
            });
            setSuccessMessage(result.message || "Your volunteer account has been created.");
            setRegistered(true);
        } catch (error) {
            setErrorMessage(
                getAuthErrorMessage(error, "We couldn’t create your account. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <AuthFrame
                description="You’re ready to continue your ImpactLink journey."
                title="Welcome to the community"
            >
                <div
                    aria-live="polite"
                    className="rounded-xl border border-sage/30 bg-sage/10 p-4 text-sm leading-6 text-dark-blue"
                    role="status"
                >
                    {successMessage}
                </div>
                <Link
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sage px-5 py-3 font-semibold text-white hover:bg-sage/90"
                    to="/login"
                >
                    Continue to login
                </Link>
            </AuthFrame>
        );
    }

    return (
        <AuthFrame
            description="Create your volunteer profile and tell us how you’d like to contribute."
            title="Volunteer registration"
            wide
        >
            <form className="space-y-7" noValidate onSubmit={handleSubmit}>
                {(errorMessage || validationMessage) && (
                    <div
                        aria-live="polite"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                    >
                        {validationMessage || errorMessage}
                    </div>
                )}

                <section aria-labelledby="volunteer-account-heading">
                    <h2 className="text-base font-bold text-navy" id="volunteer-account-heading">
                        Account details
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <FormField
                            autoComplete="name"
                            id="volunteer-full-name"
                            label="Full name"
                            name="fullName"
                            onChange={updateField}
                            required
                            value={form.fullName}
                        />
                        <FormField
                            autoComplete="email"
                            id="volunteer-email"
                            label="Email address"
                            name="email"
                            onChange={updateField}
                            required
                            type="email"
                            value={form.email}
                        />
                        <PasswordField
                            autoComplete="new-password"
                            id="volunteer-password"
                            label="Password"
                            minLength={8}
                            onChange={event => setForm(current => ({
                                ...current,
                                password: event.target.value
                            }))}
                            value={form.password}
                        />
                        <PasswordField
                            autoComplete="new-password"
                            id="volunteer-confirm-password"
                            label="Confirm password"
                            onChange={event => setForm(current => ({
                                ...current,
                                confirmPassword: event.target.value
                            }))}
                            value={form.confirmPassword}
                        />
                        <FormField
                            autoComplete="tel"
                            id="volunteer-phone"
                            label="Phone (optional)"
                            name="phone"
                            onChange={updateField}
                            type="tel"
                            value={form.phone}
                        />
                        <div>
                            <label
                                className="mb-1.5 block text-sm font-semibold text-dark-blue"
                                htmlFor="volunteer-occupation"
                            >
                                Occupation
                            </label>
                            <select
                                className="min-h-11 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
                                id="volunteer-occupation"
                                name="occupation"
                                onChange={updateField}
                                value={form.occupation}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-1.5 block text-sm font-semibold text-dark-blue"
                            htmlFor="volunteer-bio"
                        >
                            About you (optional)
                        </label>
                        <textarea
                            className="min-h-24 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-steel-blue/50 focus:border-sage focus:ring-4 focus:ring-sage/10"
                            id="volunteer-bio"
                            name="bio"
                            onChange={updateField}
                            rows="3"
                            value={form.bio}
                        />
                    </div>
                </section>

                <section aria-labelledby="volunteer-location-heading">
                    <h2 className="text-base font-bold text-navy" id="volunteer-location-heading">
                        Location
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <FormField
                            autoComplete="address-level2"
                            id="volunteer-city"
                            label="City"
                            name="city"
                            onChange={updateField}
                            value={form.city}
                        />
                        <FormField
                            autoComplete="address-level1"
                            id="volunteer-state"
                            label="State or region"
                            name="state"
                            onChange={updateField}
                            value={form.state}
                        />
                        <FormField
                            autoComplete="country-name"
                            id="volunteer-country"
                            label="Country"
                            name="country"
                            onChange={updateField}
                            value={form.country}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                id="volunteer-latitude"
                                label="Latitude (optional)"
                                name="latitude"
                                onChange={updateField}
                                type="number"
                                value={form.latitude}
                            />
                            <FormField
                                id="volunteer-longitude"
                                label="Longitude (optional)"
                                name="longitude"
                                onChange={updateField}
                                type="number"
                                value={form.longitude}
                            />
                        </div>
                    </div>
                </section>

                <section aria-labelledby="volunteer-skills-heading">
                    <h2 className="text-base font-bold text-navy" id="volunteer-skills-heading">
                        Skills and availability
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-steel-blue">
                        The current API accepts skill IDs, but doesn’t provide a skills
                        catalog. If you have the IDs, enter them separated by commas.
                        This field can be left blank.
                    </p>
                    <div className="mt-4">
                        <FormField
                            id="volunteer-skills"
                            label="Skill IDs (optional)"
                            name="skillIds"
                            onChange={updateField}
                            placeholder="For example: 1, 4"
                            value={form.skillIds}
                        />
                    </div>

                    <div className="mt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-dark-blue">
                                Weekly availability (optional)
                            </h3>
                            <button
                                className="rounded-lg border border-sage/40 px-3 py-2 text-sm font-semibold text-sage hover:bg-sage/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                                onClick={() => setForm(current => ({
                                    ...current,
                                    availability: [
                                        ...current.availability,
                                        { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" }
                                    ]
                                }))}
                                type="button"
                            >
                                Add time
                            </button>
                        </div>
                        {form.availability.length === 0 && (
                            <p className="mt-2 text-sm text-steel-blue">
                                You can add the days and hours that work for you.
                            </p>
                        )}
                        <div className="mt-3 space-y-3">
                            {form.availability.map((slot, index) => (
                                <div
                                    className="grid gap-3 rounded-xl border border-navy/10 bg-ivory/40 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
                                    key={`availability-${index}`}
                                >
                                    <div>
                                        <label
                                            className="mb-1.5 block text-xs font-semibold text-dark-blue"
                                            htmlFor={`availability-day-${index}`}
                                        >
                                            Day
                                        </label>
                                        <select
                                            className="min-h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm text-navy focus:border-sage focus:outline-none"
                                            id={`availability-day-${index}`}
                                            onChange={event => updateAvailability(index, "dayOfWeek", event.target.value)}
                                            value={slot.dayOfWeek}
                                        >
                                            {days.map(day => (
                                                <option key={day} value={day}>
                                                    {day.charAt(0) + day.slice(1).toLowerCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {["startTime", "endTime"].map(field => (
                                        <div key={field}>
                                            <label
                                                className="mb-1.5 block text-xs font-semibold text-dark-blue"
                                                htmlFor={`availability-${field}-${index}`}
                                            >
                                                {field === "startTime" ? "From" : "Until"}
                                            </label>
                                            <input
                                                className="min-h-10 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm text-navy focus:border-sage focus:outline-none"
                                                id={`availability-${field}-${index}`}
                                                onChange={event => updateAvailability(index, field, event.target.value)}
                                                required
                                                type="time"
                                                value={slot[field]}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        aria-label={`Remove availability entry ${index + 1}`}
                                        className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                                        onClick={() => setForm(current => ({
                                            ...current,
                                            availability: current.availability.filter((_, slotIndex) => slotIndex !== index)
                                        }))}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <SubmitButton loading={loading}>Create volunteer account</SubmitButton>
            </form>

            <p className="mt-6 border-t border-navy/10 pt-5 text-center text-sm text-steel-blue">
                Already registered?{" "}
                <Link className="font-semibold text-sage hover:underline" to="/login">
                    Log in
                </Link>
            </p>
        </AuthFrame>
    );
}

export default VolunteerRegistrationPage;
