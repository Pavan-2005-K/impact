import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PasswordField({
    id,
    label,
    error,
    hint,
    autoComplete,
    value,
    onChange,
    minLength,
    required = true
}) {
    const [visible, setVisible] = useState(false);
    const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark-blue" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input
                    aria-describedby={descriptionId}
                    aria-invalid={Boolean(error)}
                    autoComplete={autoComplete}
                    className={`min-h-11 w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-12 text-sm text-navy outline-none transition placeholder:text-steel-blue/50 focus:border-sage focus:ring-4 focus:ring-sage/10 ${
                        error ? "border-red-500" : "border-navy/15"
                    }`}
                    id={id}
                    minLength={minLength}
                    onChange={onChange}
                    required={required}
                    type={visible ? "text" : "password"}
                    value={value}
                />
                <button
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-steel-blue hover:text-navy focus-visible:outline-2 focus-visible:outline-sage"
                    onClick={() => setVisible(current => !current)}
                    type="button"
                >
                    {visible
                        ? <EyeOff aria-hidden="true" size={18} />
                        : <Eye aria-hidden="true" size={18} />}
                </button>
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-700" id={`${id}-error`}>
                    {error}
                </p>
            )}
            {!error && hint && (
                <p className="mt-1.5 text-xs leading-5 text-steel-blue" id={`${id}-hint`}>
                    {hint}
                </p>
            )}
        </div>
    );
}

export default PasswordField;
