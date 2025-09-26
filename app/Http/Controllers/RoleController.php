<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;


class RoleController extends Controller
{

    public function index(): Response
    {
        $roles = Role::query()
            ->with(['permissions:id,name'])
            ->orderBy('name')
            ->paginate(perPage: 10, pageName: 'page', columns: ['id', 'name'])
            ->withQueryString();

        $permissions = Permission::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['integer', 'distinct', 'exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        $permissionIds = collect($validated['permissions'])->map(fn($id) => (int) $id)->all();
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        $role->syncPermissions($permissions);

        return back()->with('success', 'Role created');
    }


    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['integer', 'distinct', 'exists:permissions,id'],
        ]);

        $role->update([
            'name' => $validated['name'],
        ]);

        $permissionIds = collect($validated['permissions'])->map(fn($id) => (int) $id)->all();
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        $role->syncPermissions($permissions);

        return back()->with('success', 'Role updated');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return back()->with('success', 'Role deleted');
    }
}
