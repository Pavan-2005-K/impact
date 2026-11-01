import { Inbox } from "lucide-react";

function EmptyState({ title, description, icon: Icon = Inbox, action }) {
    return (
        <div className="rounded-2xl border border-dashed border-steel-blue/25 bg-white px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ivory text-sage">
                <Icon aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-4 text-base font-bold text-navy">{title}</h2>
            {description && (
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-steel-blue">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export default EmptyState;
