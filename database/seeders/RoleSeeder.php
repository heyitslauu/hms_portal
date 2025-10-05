<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Artisan;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cache to ensure fresh permissions and roles
        try {
            Artisan::call('permission:cache-reset');
        } catch (\Throwable $e) {
            // ignore
        }

        $roles = [
            'admin',
            'doctor',
            'nurse',
            'marketing',
            'patient',
            'receptionist',
        ];

        // Ensure roles exist with guard_name 'web'
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Fetch permissions
        $all = Permission::where('guard_name', 'web')->pluck('name')->all();

        // Assign permissions per role (tailor as needed)
        $assign = [
            'admin' => $all,
            'doctor' => [
                'patients.view',
                'patients.view_reports',
                'results.view_tests',
                'results.view_procedures',
                'appointments.view',
                'appointments.edit',
            ],
            'nurse' => [
                'patients.view',
                'patients.edit',
                'appointments.view',
                'appointments.edit',
            ],
            'marketing' => [
                'services.view',
                'services.view_offered',
            ],
            'patient' => [
                'results.view_tests',
                'results.view_procedures',
                'appointments.view',
            ],
            'receptionist' => [
                'patients.create',
                'patients.view',
                'appointments.create',
                'results.upload',
                'results.update',
                'results.delete',
                'appointments.view',
                'appointments.edit',
                'appointments.cancel',
            ],
        ];

        foreach ($assign as $roleName => $perms) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();
            if (!$role) continue;

            // Ensure permissions exist; if not present, skip silently
            $perms = Permission::whereIn('name', $perms)->where('guard_name', 'web')->pluck('name')->all();

            // Sync for idempotence
            $role->syncPermissions($perms);
        }
    }
}
