import { AlertCircle } from "lucide-react";

function ErrorState({ title = "Something went wrong", description, onRetry }) {
    return (
        <div
            aria-live="polite"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center"
            role="alert"
        >
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-red-700">
                <AlertCircle aria-hidden="true" size={21} />
            </span>
            <h2 className="mt-3 font-bold text-red-900">{title}</h2>
            {description && (
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-800">
                    {description}
                </p>
            )}
            {onRetry && (
                <button
                    className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-white"
                    onClick={onRetry}
                    type="button"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

export default ErrorState;
