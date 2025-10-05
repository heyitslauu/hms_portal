/**
 * Example usage of the hasPermission hook in React components
 *
 * This file demonstrates how to use the permission checking hooks
 * in your components to conditionally show/hide UI elements.
 */

import { hasAllPermissions, hasAnyPermission, hasAnyRole, hasPermission, hasRole } from '@/hooks/usePermissions';

export function ExampleComponent() {
    // Single permission check
    const canCreateUsers = hasPermission('create users');
    const canEditPatients = hasPermission('edit patients');
    const canDeleteRecords = hasPermission('delete records');

    // Multiple permission checks
    const canManageUsers = hasAnyPermission(['create users', 'edit users', 'delete users']);
    const canFullyManageSystem = hasAllPermissions(['create users', 'edit users', 'manage roles']);

    // Role checks
    const isAdmin = hasRole('admin');
    const isReceptionist = hasRole('receptionist');
    const canAccessAdminArea = hasAnyRole(['admin', 'manager']);

    return (
        <div>
            {/* Conditional rendering based on permissions */}
            {canCreateUsers && <button>Create User</button>}

            {canEditPatients && <button>Edit Patient</button>}

            {canDeleteRecords && <button className="text-red-600">Delete</button>}

            {/* Role-based rendering */}
            {isAdmin && <div>Admin-only content</div>}

            {isReceptionist && <div>Receptionist dashboard</div>}

            {canAccessAdminArea && <nav>Admin Navigation</nav>}

            {/* Complex permission logic */}
            {canManageUsers ? <div>User Management Panel</div> : <div>You don't have permission to manage users</div>}
        </div>
    );
}

/**
 * Usage in action buttons (like in tables)
 */
export function ActionButtons({ user }: { user: any }) {
    const canEdit = hasPermission('edit users');
    const canDelete = hasPermission('delete users');
    const isAdmin = hasRole('admin');

    return (
        <div className="flex gap-2">
            {canEdit && <button>Edit</button>}

            {(canDelete || isAdmin) && <button className="text-red-600">Delete</button>}
        </div>
    );
}
