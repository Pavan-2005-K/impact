import { LoaderCircle } from "lucide-react";

function SubmitButton({ loading, children }) {
    return (
        <button
            className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sage px-5 py-3 font-semibold text-white transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-65"
            disabled={loading}
            type="submit"
        >
            {loading && <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />}
            {loading ? "Please wait..." : children}
        </button>
    );
}

export default SubmitButton;
