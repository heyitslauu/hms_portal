import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { serviceOfferings as serviceOfferingsRoute } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type ServiceOffering = {
    id: number;
    name: string;
    type: string;
    description?: string | null;
    price: string;
    is_available: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta?: { from: number; to: number; total: number };
};

interface OfferingsPageProps extends SharedData {
    offerings: Paginated<ServiceOffering>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Service Offerings', href: serviceOfferingsRoute().url }];

export default function ServiceOfferingsIndex() {
    const { offerings } = usePage<OfferingsPageProps>().props;
    const data = offerings?.data ?? [];

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<ServiceOffering | null>(null);

    const columns: ColumnDef<ServiceOffering>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
            },
            { accessorKey: 'type', header: 'Type' },
            {
                id: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <span className="max-w-sm truncate" title={row.original.description ?? ''}>
                        {row.original.description ?? '—'}
                    </span>
                ),
            },
            {
                id: 'price',
                header: () => <div className="text-right">Price</div>,
                cell: ({ row }) => (
                    <div className="text-right">{Number(row.original.price).toLocaleString(undefined, { style: 'currency', currency: 'PHP' })}</div>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }) =>
                    row.original.is_available ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            Available
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                            Unavailable
                        </span>
                    ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label={`Edit ${p.name}`}
                                onClick={() => {
                                    setSelected(p);
                                    setEditOpen(true);
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                aria-label={`Delete ${p.name}`}
                                onClick={() => {
                                    setSelected(p);
                                    setDeleteOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

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
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className={header.column.id === 'price' ? 'text-right' : undefined}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className={cell.column.id === 'price' ? 'text-right' : undefined}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
