function StatCard({ label, value, icon: Icon, description }) {
    return (
        <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-steel-blue">{label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-navy">
                        {value}
                    </p>
                </div>
                {Icon && (
                    <span className="grid size-11 place-items-center rounded-xl bg-ivory text-sage">
                        <Icon aria-hidden="true" size={21} />
                    </span>
                )}
            </div>
            {description && (
                <p className="mt-3 text-xs leading-5 text-steel-blue">{description}</p>
            )}
        </article>
    );
}

export default StatCard;
