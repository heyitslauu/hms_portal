import Pagination from '@/components/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { serviceOfferings as serviceOfferingsRoute } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface ServiceOffering {
    id: number;
    name: string;
    type: string;
    description?: string | null;
    price: string; // coming from decimal cast
    is_available: boolean;
}

interface PageProps extends SharedData {
    offerings: {
        data: ServiceOffering[];
        links: { url: string | null; label: string; active: boolean }[];
        meta?: { from: number; to: number; total: number };
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Service Offerings', href: serviceOfferingsRoute().url }];

export default function ServiceOfferingsIndex() {
    const { offerings } = usePage<PageProps>().props;
    const data = offerings?.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Offerings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Service Offerings</h1>
                </div>
                <div>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        The prices listed are subject to change without prior notice and may differ at the time of billing or payment at the cashier.
                        For the most accurate and up-to-date pricing, please contact us directly.
                    </p>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length ? (
                                data.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell className="font-medium">{o.name}</TableCell>
                                        <TableCell>{o.type}</TableCell>
                                        <TableCell className="max-w-sm truncate" title={o.description ?? ''}>
                                            {o.description ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {Number(o.price).toLocaleString(undefined, { style: 'currency', currency: 'PHP' })}
                                        </TableCell>
                                        <TableCell>
                                            {o.is_available ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                                    Unavailable
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No service offerings found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination links={offerings.links} meta={offerings.meta} />
            </div>
        </AppLayout>
    );
}
