function FormField({
    id,
    label,
    error,
    hint,
    className = "",
    ...inputProps
}) {
    const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={className}>
            <label className="mb-1.5 block text-sm font-semibold text-dark-blue" htmlFor={id}>
                {label}
            </label>
            <input
                aria-describedby={descriptionId}
                aria-invalid={Boolean(error)}
                className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition placeholder:text-steel-blue/50 focus:border-sage focus:ring-4 focus:ring-sage/10 ${
                    error ? "border-red-500" : "border-navy/15"
                }`}
                id={id}
                {...inputProps}
            />
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

export default FormField;
