import { Bot, X } from "lucide-react";
import { useState } from "react";
import ChatbotPanel from "./ChatbotPanel";

function ChatbotAssistant() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ChatbotPanel open={open} onClose={() => setOpen(false)} />
            <button
                aria-expanded={open}
                aria-label={open ? "Close ImpactLink AI Assistant" : "Open ImpactLink AI Assistant"}
                className="fixed bottom-5 right-5 z-[55] grid size-14 place-items-center rounded-full bg-sage text-white shadow-xl shadow-navy/20 transition hover:-translate-y-0.5 hover:bg-sage/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy sm:bottom-6 sm:right-6"
                onClick={() => setOpen(current => !current)}
                type="button"
            >
                {open
                    ? <X aria-hidden="true" size={22} />
                    : <Bot aria-hidden="true" size={24} />}
            </button>
        </>
    );
}

export default ChatbotAssistant;
