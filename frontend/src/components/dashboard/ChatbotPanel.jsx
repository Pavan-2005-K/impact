import { Bot, LoaderCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { roleLabels } from "./dashboardNavigation";

const welcomeMessages = {
    VOLUNTEER: "Hi! I can help with campaigns, applications, groups, and tasks.",
    ORGANIZATION: "Hi! I can help with campaigns, volunteers, applications, and reports.",
    ADMIN: "Hi! I can help with platform statistics and organization approvals."
};

function ChatbotPanel({ open, onClose, onSend, isLoading = false }) {
    const { role } = useAuth();
    const [message, setMessage] = useState("");
    const canSend = typeof onSend === "function" && message.trim().length > 0 && !isLoading;

    const handleSubmit = event => {
        event.preventDefault();
        if (!canSend) return;
        const nextMessage = message.trim();
        setMessage("");
        onSend(nextMessage);
    };

    if (!open) return null;

    return (
        <section
            aria-label="ImpactLink AI Assistant"
            className="fixed bottom-24 right-4 z-[60] flex h-[min(34rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-2xl shadow-navy/20 sm:bottom-24 sm:right-6"
        >
            <header className="flex items-center justify-between gap-3 bg-navy px-4 py-3.5 text-white">
                <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-sage text-white">
                        <Bot aria-hidden="true" size={21} />
                    </span>
                    <div>
                        <h2 className="text-sm font-bold">ImpactLink AI Assistant</h2>
                        <p className="mt-0.5 text-xs text-ivory/65">
                            {roleLabels[role] || "Community"} support
                        </p>
                    </div>
                </div>
                <button
                    aria-label="Close AI assistant"
                    className="grid size-9 place-items-center rounded-lg text-ivory/75 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-warm-beige"
                    onClick={onClose}
                    type="button"
                >
                    <X aria-hidden="true" size={19} />
                </button>
            </header>

            <div
                aria-live="polite"
                aria-relevant="additions text"
                className="flex-1 space-y-4 overflow-y-auto bg-ivory/45 p-4"
                role="log"
            >
                <div className="flex items-start gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sage text-white">
                        <Bot aria-hidden="true" size={17} />
                    </span>
                    <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-sm leading-6 text-dark-blue shadow-sm">
                        {welcomeMessages[role] || welcomeMessages.VOLUNTEER}
                    </p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2.5 text-sm text-steel-blue" role="status">
                        <LoaderCircle aria-hidden="true" className="animate-spin text-sage" size={17} />
                        Preparing a response...
                    </div>
                )}
            </div>

            {!onSend && (
                <p className="border-t border-navy/8 bg-white px-4 py-2 text-xs text-steel-blue">
                    Chat messaging will be connected in a later phase.
                </p>
            )}

            <form className="flex items-end gap-2 border-t border-navy/8 bg-white p-3" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="assistant-message">
                    Message the ImpactLink AI Assistant
                </label>
                <textarea
                    className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-navy/15 px-3 py-2.5 text-sm text-navy outline-none placeholder:text-steel-blue/55 focus:border-sage focus:ring-4 focus:ring-sage/10 disabled:bg-ivory/50"
                    disabled={isLoading}
                    id="assistant-message"
                    maxLength={1500}
                    onChange={event => setMessage(event.target.value)}
                    placeholder="Write a message..."
                    rows="1"
                    value={message}
                />
                <button
                    aria-label="Send message"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage text-white transition hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canSend}
                    type="submit"
                >
                    {isLoading
                        ? <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
                        : <Send aria-hidden="true" size={18} />}
                </button>
            </form>
        </section>
    );
}

export default ChatbotPanel;
