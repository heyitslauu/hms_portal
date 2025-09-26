import { Form, Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { permissions as permissionsRoute } from '@/routes';
import perms from '@/routes/permissions';
import { type BreadcrumbItem } from '@/types';

import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Permission = {
    id: number;
    name: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Permissions', href: permissionsRoute().url }];

export default function Permissions() {
    type PageLink = { url: string | null; label: string; active: boolean };
    const { permissions: pagination } = usePage<{
        permissions: { data: Permission[]; links: PageLink[]; meta: { from: number; to: number; total: number } };
    }>().props;
    const data = pagination?.data ?? [];

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Permission | null>(null);

    const columns: ColumnDef<Permission>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <span className="font-medium">{row.getValue<string>('name')}</span>,
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
    ];

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">List of Permissions</h1>
                    <Button variant="default" onClick={() => setCreateOpen(true)}>
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Permission
                        </span>
                    </Button>
                </div>

                {/* Create Dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create permission</DialogTitle>
                            <DialogDescription>Add a new permission by name.</DialogDescription>
                        </DialogHeader>
                        <Form {...perms.store.form()} onSuccess={() => setCreateOpen(false)}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 py-2">
                                        <Input id="name" name="name" placeholder="Permission name" />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                            <DialogTitle>Edit permission</DialogTitle>
                            <DialogDescription>Update the permission name.</DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...perms.update.form(selected.id)}
                                onSuccess={() => {
                                    setEditOpen(false);
                                    setSelected(null);
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2 py-2">
                                            <Input id="name" name="name" placeholder="Permission name" defaultValue={selected.name} />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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

                {/* Delete Dialog */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete permission</DialogTitle>
                            <DialogDescription>
                                {selected ? `Are you sure you want to delete "${selected.name}"? This action cannot be undone.` : 'Are you sure?'}
                            </DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...perms.destroy.form(selected.id)}
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
                                        No permissions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination links={pagination?.links ?? []} meta={pagination?.meta} />
            </div>
        </AppLayout>
    );
}
