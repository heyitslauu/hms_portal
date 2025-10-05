<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Artisan;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cached roles and permissions to avoid stale state
        try {
            Artisan::call('permission:cache-reset');
        } catch (\Throwable $e) {
            // command may not exist in some contexts; continue
        }

        $permissions = [
            // High-level
            'manage_users',
            'manage_roles',
            'manage_permissions',
            'manage_patients',
            'manage_services',
            'manage_financials',
            'manage_appointments',
            'view_reports',
            'view_results',

            // Users
            'users.create',
            'users.view',
            'users.edit',
            'users.delete',

            // Roles & permissions
            'roles.create',
            'roles.view',
            'roles.edit',
            'roles.delete',
            'permissions.assign',
            'permissions.revoke',

            // Patients
            'patients.create',
            'patients.view',
            'patients.edit',
            'patients.delete',
            'patients.view_reports',

            // Services offered
            'services.create',
            'services.view',
            'services.edit',
            'services.delete',
            'services.view_offered',

            // Results
            'results.upload',
            'results.view_tests',
            'results.update',
            'results.delete',
            'results.view_procedures',

            // Financials
            'payments.process',

            // Appointments
            'appointments.create',
            'appointments.view',
            'appointments.edit',
            'appointments.cancel',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }
}
