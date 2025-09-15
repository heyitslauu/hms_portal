import { roles as rolesRoutes } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type RolePermissionPivot = {
    role_id: number;
    permission_id: number;
};

type RolePermission = {
    id: number;
    name: string;
    pivot: RolePermissionPivot;
};

type Role = {
    id: number;
    name: string;
    permissions: RolePermission[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles', href: rolesRoutes().url }];
export default function Roles() {
    const { roles: rolesList, permissions: allPermissions } = usePage<SharedData & { roles: Role[]; permissions?: { id: number; name: string }[] }>()
        .props;
    const data = rolesList ?? [];
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Role | null>(null);

    const columns: ColumnDef<Role>[] = [
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
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">List of Roles</h1>
                    <Button variant="default" onClick={() => setCreateOpen(true)}>
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Role
                        </span>
                    </Button>
                </div>

                {/* Create Dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create role</DialogTitle>
                            <DialogDescription>Create a role and assign permissions.</DialogDescription>
                        </DialogHeader>
                        <Form {...roles.store.form()} onSuccess={() => setCreateOpen(false)}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="mb-4 grid gap-2 py-2">
                                        <Input id="name" name="name" placeholder="Role name" />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div className="grid max-h-[300px] gap-2 overflow-auto py-2 pr-1">
                                        <div className="text-sm font-medium">Permissions</div>
                                        {!allPermissions?.length && <p className="text-sm text-muted-foreground">No permissions available.</p>}
                                        {allPermissions?.map((perm) => (
                                            <label key={perm.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value={perm.id}
                                                    className="size-4 rounded border border-input text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                <span className="text-sm">{perm.name}</span>
                                            </label>
                                        ))}
                                        {errors.permissions && <p className="text-sm text-red-600">{String(errors.permissions)}</p>}
                                        {Object.entries(errors)
                                            .filter(([k]) => k.startsWith('permissions.'))
                                            .map(([, v], i) => (
                                                <p key={i} className="text-sm text-red-600">
                                                    {String(v)}
                                                </p>
                                            ))}
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
                            <DialogTitle>Edit role</DialogTitle>
                            <DialogDescription>Update the role name.</DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...roles.update.form(selected.id)}
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
                                        <div className="grid max-h-[300px] gap-2 overflow-auto py-2 pr-1">
                                            <div className="text-sm font-medium">Permissions</div>
                                            {!allPermissions?.length && <p className="text-sm text-muted-foreground">No permissions available.</p>}
                                            {allPermissions?.map((ap) => {
                                                const isAssigned = selected.permissions?.some((sp) => sp.id === ap.id) ?? false;
                                                return (
                                                    <label key={ap.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            name="permissions[]"
                                                            value={ap.id}
                                                            defaultChecked={isAssigned}
                                                            className="size-4 rounded border border-input text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                        <span className="text-sm">{ap.name}</span>
                                                    </label>
                                                );
                                            })}
                                            {Object.entries(errors)
                                                .filter(([k]) => k.startsWith('permissions.'))
                                                .map(([, v], i) => (
                                                    <p key={i} className="text-sm text-red-600">
                                                        {String(v)}
                                                    </p>
                                                ))}
                                            {errors.permissions && <p className="text-sm text-red-600">{String(errors.permissions)}</p>}
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
                            <DialogTitle>Delete role</DialogTitle>
                            <DialogDescription>
                                {selected ? `Are you sure you want to delete "${selected.name}"? This action cannot be undone.` : 'Are you sure?'}
                            </DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...roles.destroy.form(selected.id)}
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
            </div>
        </AppLayout>
    );
}
