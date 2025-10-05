import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hasPermission } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { patients as patientsRoute } from '@/routes';
import patients from '@/routes/patients';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
type Patient = {
    id: number;
    user: { id: number; name: string; email: string };
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    birthday: string;
    address: string;
    phone?: string | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    meta?: { from: number; to: number; total: number };
};

interface PatientsPageProps extends SharedData {
    patients: Paginated<Patient>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Patients', href: patientsRoute().url }];

export default function PatientsIndex() {
    const { patients: pagination } = usePage<PatientsPageProps>().props;
    const data = pagination?.data ?? [];
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Patient | null>(null);

    // Permission checks
    const canCreate = hasPermission('patients.create');
    const canEdit = hasPermission('patients.edit');
    const canDelete = hasPermission('patients.delete');

    const columns: ColumnDef<Patient>[] = useMemo(() => {
        const baseColumns: ColumnDef<Patient>[] = [
            {
                id: 'name',
                header: 'Name',
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <span className="font-medium">
                            {p.first_name} {p.middle_name ? p.middle_name + ' ' : ''}
                            {p.last_name}
                        </span>
                    );
                },
            },
            { accessorKey: 'user.email', header: 'Email', cell: ({ row }) => row.original.user.email },
            { accessorKey: 'birthday', header: 'Birthday' },
            { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => row.original.phone ?? '—' },
            {
                accessorKey: 'address',
                header: 'Address',
                cell: ({ row }) => (
                    <span className="truncate" title={row.original.address}>
                        {row.original.address}
                    </span>
                ),
            },
        ];

        // Only add actions column if user has edit or delete permissions
        if (canEdit || canDelete) {
            baseColumns.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const p = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            {canEdit && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label={`Edit ${p.first_name}`}
                                    onClick={() => {
                                        setSelected(p);
                                        setEditOpen(true);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    aria-label={`Delete ${p.first_name}`}
                                    onClick={() => {
                                        setSelected(p);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    );
                },
            });
        }

        return baseColumns;
    }, [canEdit, canDelete]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Patients</h1>
                    {canCreate && (
                        <Button variant="default" onClick={() => setCreateOpen(true)}>
                            <span className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Register Patient
                            </span>
                        </Button>
                    )}
                </div>

                {/* Create Dialog */}
                {canCreate && (
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register patient</DialogTitle>
                                <DialogDescription>Create a patient profile and linked user account.</DialogDescription>
                            </DialogHeader>
                            <Form {...patients.store.form()} onSuccess={() => setCreateOpen(false)}>
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-3 gap-2 py-2">
                                            <div className="col-span-1">
                                                <Input id="first_name" name="first_name" placeholder="First name" />
                                                {errors.first_name && <p className="text-sm text-red-600">{String(errors.first_name)}</p>}
                                            </div>
                                            <div className="col-span-1">
                                                <Input id="middle_name" name="middle_name" placeholder="Middle name" />
                                                {errors.middle_name && <p className="text-sm text-red-600">{String(errors.middle_name)}</p>}
                                            </div>
                                            <div className="col-span-1">
                                                <Input id="last_name" name="last_name" placeholder="Last name" />
                                                {errors.last_name && <p className="text-sm text-red-600">{String(errors.last_name)}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="name" name="name" placeholder="Account full name" />
                                            {errors.name && <p className="text-sm text-red-600">{String(errors.name)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <label htmlFor="birthday" className="text-sm font-medium">
                                                Birthday
                                            </label>
                                            <Input id="birthday" name="birthday" type="date" />
                                            {errors.birthday && <p className="text-sm text-red-600">{String(errors.birthday)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="phone" name="phone" placeholder="Phone" />
                                            {errors.phone && <p className="text-sm text-red-600">{String(errors.phone)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="address" name="address" placeholder="Address" />
                                            {errors.address && <p className="text-sm text-red-600">{String(errors.address)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="email" name="email" type="email" placeholder="Email address" />
                                            {errors.email && <p className="text-sm text-red-600">{String(errors.email)}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="password" name="password" type="password" placeholder="Password" />
                                            {errors.password && <p className="text-sm text-red-600">{String(errors.password)}</p>}
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
                )}

                {/* Edit Dialog */}
                {canEdit && (
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit patient</DialogTitle>
                                <DialogDescription>Update patient profile and linked user account.</DialogDescription>
                            </DialogHeader>
                            {selected && (
                                <Form
                                    {...patients.update.form(selected.id)}
                                    onSuccess={() => {
                                        setEditOpen(false);
                                        setSelected(null);
                                    }}
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid grid-cols-3 gap-2 py-2">
                                                <div className="col-span-1">
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        defaultValue={selected.first_name}
                                                        placeholder="First name"
                                                    />
                                                    {errors.first_name && <p className="text-sm text-red-600">{String(errors.first_name)}</p>}
                                                </div>
                                                <div className="col-span-1">
                                                    <Input
                                                        id="middle_name"
                                                        name="middle_name"
                                                        defaultValue={selected.middle_name ?? ''}
                                                        placeholder="Middle"
                                                    />
                                                    {errors.middle_name && <p className="text-sm text-red-600">{String(errors.middle_name)}</p>}
                                                </div>
                                                <div className="col-span-1">
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        defaultValue={selected.last_name}
                                                        placeholder="Last name"
                                                    />
                                                    {errors.last_name && <p className="text-sm text-red-600">{String(errors.last_name)}</p>}
                                                </div>
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <Input id="name" name="name" defaultValue={selected.user.name} placeholder="Account full name" />
                                                {errors.name && <p className="text-sm text-red-600">{String(errors.name)}</p>}
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <label htmlFor="birthday" className="text-sm font-medium">
                                                    Birthday
                                                </label>
                                                <Input id="birthday" name="birthday" type="date" defaultValue={selected.birthday} />
                                                {errors.birthday && <p className="text-sm text-red-600">{String(errors.birthday)}</p>}
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <Input id="phone" name="phone" defaultValue={selected.phone ?? ''} placeholder="Phone" />
                                                {errors.phone && <p className="text-sm text-red-600">{String(errors.phone)}</p>}
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <Input id="address" name="address" defaultValue={selected.address} placeholder="Address" />
                                                {errors.address && <p className="text-sm text-red-600">{String(errors.address)}</p>}
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    defaultValue={selected.user.email}
                                                    placeholder="Email address"
                                                />
                                                {errors.email && <p className="text-sm text-red-600">{String(errors.email)}</p>}
                                            </div>
                                            <div className="grid gap-2 py-2">
                                                <Input id="password" name="password" type="password" placeholder="New password (optional)" />
                                                {errors.password && <p className="text-sm text-red-600">{String(errors.password)}</p>}
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={processing}>
                                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                {/* Delete Dialog */}
                {canDelete && (
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete patient</DialogTitle>
                                <DialogDescription>
                                    {selected
                                        ? `Are you sure you want to delete \"${selected.first_name} ${selected.last_name}\"? This will also soft delete the linked user.`
                                        : 'Are you sure?'}
                                </DialogDescription>
                            </DialogHeader>
                            {selected && (
                                <Form
                                    {...patients.destroy.form(selected.id)}
                                    onSuccess={() => {
                                        setDeleteOpen(false);
                                        setSelected(null);
                                    }}
                                >
                                    {({ processing }) => (
                                        <DialogFooter>
                                            <Button type="submit" variant="destructive" disabled={processing}>
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Confirm delete
                                            </Button>
                                        </DialogFooter>
                                    )}
                                </Form>
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
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
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No patients found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination links={pagination.links} meta={pagination.meta} />
            </div>
        </AppLayout>
    );
}
