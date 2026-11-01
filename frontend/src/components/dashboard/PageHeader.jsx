import { ChevronRight } from "lucide-react";

function PageHeader({ title, description, breadcrumb = [] }) {
    return (
        <div className="mb-6">
            {breadcrumb.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-2">
                    <ol className="flex flex-wrap items-center gap-1.5 text-xs text-steel-blue">
                        {breadcrumb.map((item, index) => (
                            <li className="inline-flex items-center gap-1.5" key={`${item}-${index}`}>
                                {index > 0 && <ChevronRight aria-hidden="true" size={13} />}
                                <span aria-current={index === breadcrumb.length - 1 ? "page" : undefined}>
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">{title}</h1>
            {description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-steel-blue sm:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}

export default PageHeader;
