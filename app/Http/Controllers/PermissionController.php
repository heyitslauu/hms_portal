<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{

    public function index(): Response
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->paginate(perPage: 10, pageName: 'page', columns: ['id', 'name'])
            ->withQueryString();

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
        ]);

        Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return back()->with('success', 'Permission created');
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'name')->ignore($permission->id),
            ],
        ]);

        $permission->update(['name' => $validated['name']]);

        return back()->with('success', 'Permission updated');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return back()->with('success', 'Permission deleted');
    }
}
