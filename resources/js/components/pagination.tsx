import { router } from '@inertiajs/react';

type Link = { url: string | null; label: string; active: boolean };
type Meta = { from: number | null; to: number | null; total: number };
type PaginationProps = { links: Link[]; meta?: Meta };

export default function Pagination({ links }: PaginationProps) {
    if (!links?.length) return null;
    return (
        <nav className="flex items-center justify-end gap-1 py-3" aria-label="Pagination">
            {links.map((link, i) => {
                const label = link.label.replace(
                    /&laquo;|&raquo;|&lsaquo;|&rsaquo;/g,
                    (m) =>
                        ({
                            '&laquo;': '«',
                            '&raquo;': '»',
                            '&lsaquo;': '‹',
                            '&rsaquo;': '›',
                        })[m] as string,
                );
                const disabled = !link.url;
                return (
                    <button
                        key={i}
                        disabled={disabled}
                        onClick={() => link.url && router.get(link.url)}
                        className={`h-9 rounded-md border px-3 text-sm ${
                            link.active ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                        } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted'}`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </nav>
    );
}
