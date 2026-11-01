import { LoaderCircle } from "lucide-react";

function LoadingState({ label = "Loading..." }) {
    return (
        <div
            aria-live="polite"
            className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-navy/8 bg-white text-sm font-medium text-steel-blue"
            role="status"
        >
            <LoaderCircle aria-hidden="true" className="animate-spin text-sage" size={20} />
            {label}
        </div>
    );
}

export default LoadingState;
