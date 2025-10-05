<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{

    public function index()
    {
        $users = User::query()
            ->with(['roles:id,name'])
            ->orderBy('name')
            ->paginate(perPage: 10, pageName: 'page', columns: ['id', 'name', 'email', 'department', 'created_at'])
            ->withQueryString();

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'departments' => config('departments'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if receptionist role is selected to make department required
        $isReceptionist = false;
        if (!empty($request->input('roles'))) {
            $receptionistRole = Role::where('name', 'receptionist')->first();
            $isReceptionist = $receptionistRole && in_array($receptionistRole->id, $request->input('roles', []));
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'department' => $isReceptionist ? ['required', Rule::in(config('departments'))] : ['nullable', Rule::in(config('departments'))],
            // optional role assignment
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id', 'distinct'],
        ]);

        $user = new User();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->department = $validated['department'] ?? null;
        $user->password = Hash::make($validated['password']);

        // Default all new users to verified
        $user->email_verified_at = now();

        $user->save();

        // Sync roles if provided
        if (!empty($validated['roles'])) {
            // fetch roles by ids to avoid guard/name confusion
            $roles = Role::query()->whereIn('id', $validated['roles'])->get();
            if ($roles->isNotEmpty()) {
                $user->syncRoles($roles);
            }
        }

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Check if receptionist role is selected to make department required
        $isReceptionist = false;
        if (!empty($request->input('roles'))) {
            $receptionistRole = Role::where('name', 'receptionist')->first();
            $isReceptionist = $receptionistRole && in_array($receptionistRole->id, $request->input('roles', []));
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'department' => $isReceptionist ? ['sometimes', 'required', Rule::in(config('departments'))] : ['sometimes', 'nullable', Rule::in(config('departments'))],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['integer', 'exists:roles,id', 'distinct'],
        ]);

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (array_key_exists('department', $validated)) {
            $user->department = $validated['department'];
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }


        $user->save();

        if (array_key_exists('roles', $validated)) {
            $roles = Role::query()->whereIn('id', $validated['roles'] ?? [])->get();
            $user->syncRoles($roles);
        }

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }
}
