import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { serviceOfferings as serviceOfferingsRoute } from '@/routes';
import serviceOfferings from '@/routes/service-offerings';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { EyeOff, LoaderCircle, Pencil, Plus } from 'lucide-react';
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

// Map department config values to proper labels
const departmentOptions = [
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'obgyn', label: 'OB/GYN' },
    { value: 'heart-station', label: 'Heart Station' },
];

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
                                variant={p.is_available ? 'outline' : 'default'}
                                size="icon"
                                aria-label={`${p.is_available ? 'Mark unavailable' : 'Mark available'} ${p.name}`}
                                onClick={() => {
                                    setSelected(p);
                                    setDeleteOpen(true);
                                }}
                            >
                                <EyeOff className="h-4 w-4" />
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
                    <Button variant="default" onClick={() => setCreateOpen(true)}>
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Service Offering
                        </span>
                    </Button>
                </div>
                <div>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        The prices listed are subject to change without prior notice and may differ at the time of billing or payment at the cashier.
                        For the most accurate and up-to-date pricing, please contact us directly.
                    </p>
                </div>

                {/* Create Dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Service Offering</DialogTitle>
                            <DialogDescription>Add a new service offering to the system.</DialogDescription>
                        </DialogHeader>
                        <Form {...serviceOfferings.store.form()} onSuccess={() => setCreateOpen(false)}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 py-2">
                                        <Input id="name" name="name" placeholder="Service name" />
                                        {errors.name && <p className="text-sm text-red-600">{String(errors.name)}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Select name="type">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departmentOptions.map((dept) => (
                                                    <SelectItem key={dept.value} value={dept.value}>
                                                        {dept.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-sm text-red-600">{String(errors.type)}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Input id="description" name="description" placeholder="Description (optional)" />
                                        {errors.description && <p className="text-sm text-red-600">{String(errors.description)}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Input id="price" name="price" type="number" step="0.01" placeholder="Price" />
                                        {errors.price && <p className="text-sm text-red-600">{String(errors.price)}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                id="is_available"
                                                name="is_available"
                                                type="checkbox"
                                                defaultChecked
                                                value="1"
                                                className="rounded"
                                            />
                                            <span className="text-sm">Available for booking</span>
                                        </label>
                                        {errors.is_available && <p className="text-sm text-red-600">{String(errors.is_available)}</p>}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Service Offering</DialogTitle>
                            <DialogDescription>Update the service offering details.</DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...serviceOfferings.update.form(selected.id)}
                                onSuccess={() => {
                                    setEditOpen(false);
                                    setSelected(null);
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2 py-2">
                                            <Input id="name" name="name" defaultValue={selected.name} placeholder="Service name" />
                                            {errors.name && <p className="text-sm text-red-600">{String(errors.name)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Select name="type" defaultValue={selected.type}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select service type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departmentOptions.map((dept) => (
                                                        <SelectItem key={dept.value} value={dept.value}>
                                                            {dept.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.type && <p className="text-sm text-red-600">{String(errors.type)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input
                                                id="description"
                                                name="description"
                                                defaultValue={selected.description ?? ''}
                                                placeholder="Description (optional)"
                                            />
                                            {errors.description && <p className="text-sm text-red-600">{String(errors.description)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={selected.price}
                                                placeholder="Price"
                                            />
                                            {errors.price && <p className="text-sm text-red-600">{String(errors.price)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    id="is_available"
                                                    name="is_available"
                                                    type="checkbox"
                                                    defaultChecked={selected.is_available}
                                                    value="1"
                                                    className="rounded"
                                                />
                                                <span className="text-sm">Available for booking</span>
                                            </label>
                                            {errors.is_available && <p className="text-sm text-red-600">{String(errors.is_available)}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={processing}>
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Toggle Availability Dialog */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Toggle Availability</DialogTitle>
                            <DialogDescription>
                                {selected
                                    ? `Are you sure you want to mark "${selected.name}" as ${selected.is_available ? 'unavailable' : 'available'}? This will ${selected.is_available ? 'hide' : 'show'} it from public listings.`
                                    : 'Are you sure?'}
                            </DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...serviceOfferings.destroy.form(selected.id)}
                                onSuccess={() => {
                                    setDeleteOpen(false);
                                    setSelected(null);
                                }}
                            >
                                {({ processing }) => (
                                    <DialogFooter>
                                        <Button type="submit" variant={selected.is_available ? 'destructive' : 'default'} disabled={processing}>
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            {selected.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                        </Button>
                                    </DialogFooter>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>

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
