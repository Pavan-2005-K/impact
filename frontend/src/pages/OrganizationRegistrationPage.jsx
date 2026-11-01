import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import { getAuthErrorMessage, registerOrganization } from "../services/authApi";

const initialForm = {
    contactPersonName: "",
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    registrationNumber: "",
    organizationType: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India"
};

function OrganizationRegistrationPage() {
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

    const handleSubmit = async event => {
        event.preventDefault();
        if (loading) return;
        setErrorMessage("");
        setValidationMessage("");

        const normalizedEmail = form.email.trim();
        if (!form.contactPersonName.trim() || !form.organizationName.trim()) {
            setValidationMessage("Contact person name and organization name are required.");
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

        setLoading(true);
        try {
            const result = await registerOrganization({
                contactPersonName: form.contactPersonName.trim(),
                organizationName: form.organizationName.trim(),
                email: normalizedEmail,
                password: form.password,
                phone: form.phone.trim() || undefined,
                registrationNumber: form.registrationNumber.trim() || undefined,
                organizationType: form.organizationType.trim() || undefined,
                description: form.description.trim() || undefined,
                address: form.address.trim() || undefined,
                city: form.city.trim() || undefined,
                state: form.state.trim() || undefined,
                country: form.country.trim() || undefined
            });

            if (result.approvalStatus !== "PENDING") {
                setErrorMessage(
                    "Your account was created, but the server did not confirm its approval status. Please contact support before attempting to manage campaigns."
                );
                return;
            }

            setSuccessMessage(
                result.message || "Your organization account is pending admin approval."
            );
            setRegistered(true);
        } catch (error) {
            setErrorMessage(
                getAuthErrorMessage(error, "We couldn’t register your organization. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <AuthFrame
                description="Your organization profile has been submitted for review."
                title="Registration received"
            >
                <div
                    aria-live="polite"
                    className="rounded-xl border border-warm-beige bg-ivory p-5 text-sm leading-6 text-dark-blue"
                    role="status"
                >
                    <p className="font-bold text-navy">Pending admin approval</p>
                    <p className="mt-2">{successMessage}</p>
                    <p className="mt-2">
                        You can log in to check your account status. Campaign management
                        remains unavailable until your organization is approved.
                    </p>
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
            description="Create an organization profile. The backend will mark new organizations as pending admin approval."
            title="Organization registration"
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

                <section aria-labelledby="organization-account-heading">
                    <h2 className="text-base font-bold text-navy" id="organization-account-heading">
                        Account details
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <FormField
                            autoComplete="name"
                            id="organization-contact-name"
                            label="Contact person name"
                            name="contactPersonName"
                            onChange={updateField}
                            required
                            value={form.contactPersonName}
                        />
                        <FormField
                            autoComplete="organization"
                            id="organization-name"
                            label="Organization name"
                            name="organizationName"
                            onChange={updateField}
                            required
                            value={form.organizationName}
                        />
                        <FormField
                            autoComplete="email"
                            id="organization-email"
                            label="Email address"
                            name="email"
                            onChange={updateField}
                            required
                            type="email"
                            value={form.email}
                        />
                        <FormField
                            autoComplete="tel"
                            id="organization-phone"
                            label="Phone (optional)"
                            name="phone"
                            onChange={updateField}
                            type="tel"
                            value={form.phone}
                        />
                        <PasswordField
                            autoComplete="new-password"
                            id="organization-password"
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
                            id="organization-confirm-password"
                            label="Confirm password"
                            onChange={event => setForm(current => ({
                                ...current,
                                confirmPassword: event.target.value
                            }))}
                            value={form.confirmPassword}
                        />
                    </div>
                </section>

                <section aria-labelledby="organization-profile-heading">
                    <h2 className="text-base font-bold text-navy" id="organization-profile-heading">
                        Organization profile
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="organization-registration-number"
                            label="Registration number (optional)"
                            name="registrationNumber"
                            onChange={updateField}
                            value={form.registrationNumber}
                        />
                        <FormField
                            id="organization-type"
                            label="Organization type (optional)"
                            name="organizationType"
                            onChange={updateField}
                            placeholder="For example: nonprofit"
                            value={form.organizationType}
                        />
                        <div className="sm:col-span-2">
                            <label
                                className="mb-1.5 block text-sm font-semibold text-dark-blue"
                                htmlFor="organization-description"
                            >
                                Description (optional)
                            </label>
                            <textarea
                                className="min-h-24 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-steel-blue/50 focus:border-sage focus:ring-4 focus:ring-sage/10"
                                id="organization-description"
                                name="description"
                                onChange={updateField}
                                rows="3"
                                value={form.description}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <FormField
                                autoComplete="street-address"
                                id="organization-address"
                                label="Address (optional)"
                                name="address"
                                onChange={updateField}
                                value={form.address}
                            />
                        </div>
                        <FormField
                            autoComplete="address-level2"
                            id="organization-city"
                            label="City (optional)"
                            name="city"
                            onChange={updateField}
                            value={form.city}
                        />
                        <FormField
                            autoComplete="address-level1"
                            id="organization-state"
                            label="State or region (optional)"
                            name="state"
                            onChange={updateField}
                            value={form.state}
                        />
                        <FormField
                            autoComplete="country-name"
                            id="organization-country"
                            label="Country (optional)"
                            name="country"
                            onChange={updateField}
                            value={form.country}
                        />
                    </div>
                    <p className="mt-4 rounded-xl border border-warm-beige bg-ivory/70 px-4 py-3 text-sm leading-6 text-dark-blue">
                        Verification document upload isn’t available through the current
                        registration API. Registration details above will be submitted
                        for admin review.
                    </p>
                </section>

                <SubmitButton loading={loading}>Submit organization registration</SubmitButton>
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

export default OrganizationRegistrationPage;
