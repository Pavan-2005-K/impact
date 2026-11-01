import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import { useAuth } from "../context/useAuth";
import { getAuthErrorMessage, login } from "../services/authApi";
import { getRoleHomePath } from "../routes/roleRoutes";

function LoginPage() {
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

            setSession({ token: result.token, user: result.user });
            navigate(getRoleHomePath(result.user), { replace: true });
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
            description="Log in to continue your work with the ImpactLink community."
            title="Welcome back"
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
                    autoComplete="email"
                    id="login-email"
                    label="Email address"
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                />
                <PasswordField
                    autoComplete="current-password"
                    id="login-password"
                    label="Password"
                    onChange={event => setPassword(event.target.value)}
                    value={password}
                />
                <SubmitButton loading={loading}>Log in</SubmitButton>
            </form>

            <div className="mt-6 border-t border-navy/10 pt-5 text-center text-sm text-steel-blue">
                <p>
                    New to ImpactLink?{" "}
                    <Link className="font-semibold text-sage hover:underline" to="/register">
                        Create an account
                    </Link>
                </p>
                <p className="mt-3">
                    Need administrator access?{" "}
                    <Link className="font-semibold text-sage hover:underline" to="/admin/login">
                        Admin login
                    </Link>
                </p>
            </div>
        </AuthFrame>
    );
}

export default LoginPage;
