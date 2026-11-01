import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import { useAuth } from "../context/useAuth";
import { getAuthErrorMessage, login } from "../services/authApi";

function AdminLoginPage() {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async event => {
        event.preventDefault();
        if (loading) return;

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !password) {
            setErrorMessage("Email and password are required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setErrorMessage("Enter a valid email address.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        try {
            const result = await login({ email: normalizedEmail, password });
            if (!result?.token || !result.user?.role) {
                setErrorMessage("The login response was incomplete. Please try again.");
                return;
            }
            if (result.user.role !== "ADMIN") {
                setErrorMessage("This account does not have administrator access.");
                return;
            }

            setSession({ token: result.token, user: result.user });
            navigate("/admin/dashboard", { replace: true });
        } catch (error) {
            setErrorMessage(
                getAuthErrorMessage(error, "We couldn’t log you in. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFrame
            description="Sign in with your administrator account to continue."
            title="Admin portal"
        >
            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                {errorMessage && (
                    <div
                        aria-live="polite"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}
                <FormField
                    autoComplete="username"
                    id="admin-email"
                    label="Administrator email"
                    onChange={event => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                    type="email"
                    value={email}
                />
                <PasswordField
                    autoComplete="current-password"
                    id="admin-password"
                    label="Password"
                    onChange={event => setPassword(event.target.value)}
                    value={password}
                />
                <SubmitButton loading={loading}>Log in to Admin Portal</SubmitButton>
            </form>
            <p className="mt-6 border-t border-navy/10 pt-5 text-center text-sm text-steel-blue">
                <Link className="font-semibold text-sage hover:underline" to="/login">
                    Return to member login
                </Link>
            </p>
        </AuthFrame>
    );
}

export default AdminLoginPage;
