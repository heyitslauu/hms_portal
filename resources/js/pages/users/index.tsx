import { users as usersRoute } from '@/routes';
import users from '@/routes/users';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

type Role = { id: number; name: string };
type User = { id: number; name: string; email: string; department?: string | null; roles?: Role[] };

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: usersRoute().url }];

export default function Users() {
    const {
        users: pagination,
        roles: allRoles,
        departments,
    } = usePage<
        SharedData & {
            users: {
                data: User[];
                links: { url: string | null; label: string; active: boolean }[];
                meta: { from: number; to: number; total: number };
            };
            roles: Role[];
            departments: string[];
        }
    >().props;
    const data = pagination?.data ?? [];
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<User | null>(null);

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.getValue<string>('name')}</span> },
            { accessorKey: 'email', header: 'Email' },
            { accessorKey: 'department', header: 'Department', cell: ({ row }) => row.getValue('department') ?? '-' },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label={`Edit ${u.name}`}
                                onClick={() => {
                                    setSelected(u);
                                    setEditOpen(true);
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                aria-label={`Delete ${u.name}`}
                                onClick={() => {
                                    setSelected(u);
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
        [setCreateOpen],
    );

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Button variant="default" onClick={() => setCreateOpen(true)}>
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create User
                        </span>
                    </Button>
                </div>

                {/* Create Dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create user</DialogTitle>
                            <DialogDescription>Create a user and optionally assign roles.</DialogDescription>
                        </DialogHeader>
                        <Form {...users.store.form()} onSuccess={() => setCreateOpen(false)}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 py-2">
                                        <Input id="name" name="name" placeholder="Full name" />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Input id="email" name="email" type="email" placeholder="Email address" />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Input id="password" name="password" type="password" placeholder="Password" />
                                        {errors.password && typeof errors.password === 'string' && (
                                            <p className="text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                    <div className="grid gap-2 py-2">
                                        <label htmlFor="department" className="text-sm font-medium">
                                            Department
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                        >
                                            <option value="">Select department</option>
                                            {departments?.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.department && <p className="text-sm text-red-600">{String(errors.department)}</p>}
                                    </div>
                                    <div className="grid max-h-[200px] gap-2 overflow-auto py-2 pr-1">
                                        <div className="text-sm font-medium">Roles</div>
                                        {!allRoles?.length && <p className="text-sm text-muted-foreground">No roles available.</p>}
                                        {allRoles?.map((r) => (
                                            <label key={r.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="roles[]"
                                                    value={r.id}
                                                    className="size-4 rounded border border-input text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                <span className="text-sm">{r.name}</span>
                                            </label>
                                        ))}
                                        {errors.roles && <p className="text-sm text-red-600">{String(errors.roles)}</p>}
                                        {Object.entries(errors)
                                            .filter(([k]) => k.startsWith('roles.'))
                                            .map(([, v], i) => (
                                                <p key={i} className="text-sm text-red-600">
                                                    {String(v)}
                                                </p>
                                            ))}
                                    </div>
                                    <div className="flex items-center gap-2 py-2">
                                        <input type="hidden" name="verified" value="0" />
                                        <input id="verified" name="verified" type="checkbox" value="1" className="size-4" />
                                        <label htmlFor="verified" className="text-sm">
                                            Mark email as verified
                                        </label>
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
                            <DialogTitle>Edit user</DialogTitle>
                            <DialogDescription>Update user profile and roles.</DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...users.update.form(selected.id)}
                                onSuccess={() => {
                                    setEditOpen(false);
                                    setSelected(null);
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2 py-2">
                                            <Input id="name" name="name" placeholder="Full name" defaultValue={selected.name} />
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="email" name="email" type="email" placeholder="Email address" defaultValue={selected.email} />
                                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <label htmlFor="department" className="text-sm font-medium">
                                                Department
                                            </label>
                                            <select
                                                id="department"
                                                name="department"
                                                defaultValue={selected.department ?? ''}
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                            >
                                                <option value="">Select department</option>
                                                {departments?.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.department && <p className="text-sm text-red-600">{String(errors.department)}</p>}
                                        </div>
                                        <div className="grid max-h-[200px] gap-2 overflow-auto py-2 pr-1">
                                            <div className="text-sm font-medium">Roles</div>
                                            {!allRoles?.length && <p className="text-sm text-muted-foreground">No roles available.</p>}
                                            {allRoles?.map((r) => {
                                                const assigned = selected.roles?.some((sr) => sr.id === r.id) ?? false;
                                                return (
                                                    <label key={r.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            name="roles[]"
                                                            value={r.id}
                                                            defaultChecked={assigned}
                                                            className="size-4 rounded border border-input text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                        <span className="text-sm">{r.name}</span>
                                                    </label>
                                                );
                                            })}
                                            {errors.roles && <p className="text-sm text-red-600">{String(errors.roles)}</p>}
                                            {Object.entries(errors)
                                                .filter(([k]) => k.startsWith('roles.'))
                                                .map(([, v], i) => (
                                                    <p key={i} className="text-sm text-red-600">
                                                        {String(v)}
                                                    </p>
                                                ))}
                                        </div>
                                        <div className="grid gap-2 py-2">
                                            <Input id="password" name="password" type="password" placeholder="New password (optional)" />
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                placeholder="Confirm new password"
                                            />
                                            {errors.password && typeof errors.password === 'string' && (
                                                <p className="text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 py-2">
                                            <input type="hidden" name="verified" value="0" />
                                            <input
                                                id="verified"
                                                name="verified"
                                                type="checkbox"
                                                value="1"
                                                className="size-4"
                                                defaultChecked={false}
                                            />
                                            <label htmlFor="verified" className="text-sm">
                                                Mark email as verified
                                            </label>
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
                            <DialogTitle>Delete user</DialogTitle>
                            <DialogDescription>
                                {selected
                                    ? `Are you sure you want to delete "${selected.name}"? This action can be undone via soft-deletes.`
                                    : 'Are you sure?'}
                            </DialogDescription>
                        </DialogHeader>
                        {selected && (
                            <Form
                                {...users.destroy.form(selected.id)}
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
                                        No users found
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
