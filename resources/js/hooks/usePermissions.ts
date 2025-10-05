import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook to check if the authenticated user has a specific permission
 *
 * @param permission - The permission string to check for
 * @returns boolean - true if user has the permission, false otherwise
 *
 * @example
 * const canEditUsers = hasPermission('edit users');
 * const canDeletePosts = hasPermission('delete posts');
 *
 * if (canEditUsers) {
 *   // Show edit button
 * }
 */
export function hasPermission(permission: string): boolean {
    const { auth } = usePage<SharedData>().props;

    // Return false if no auth data, no user, or no permissions array
    if (!auth?.user?.permissions || !Array.isArray(auth.user.permissions)) {
        return false;
    }

    // Check if the permission exists in the user's permissions array
    return auth.user.permissions.includes(permission);
}

/**
 * Custom hook to check if the authenticated user has any of the specified permissions
 *
 * @param permissions - Array of permission strings to check for
 * @returns boolean - true if user has at least one of the permissions
 *
 * @example
 * const canManageUsers = hasAnyPermission(['create users', 'edit users', 'delete users']);
 */
export function hasAnyPermission(permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;

    if (!auth?.user?.permissions || !Array.isArray(auth.user.permissions)) {
        return false;
    }

    // Check if user has any of the specified permissions
    return permissions.some((permission) => auth.user!.permissions.includes(permission));
}

/**
 * Custom hook to check if the authenticated user has all of the specified permissions
 *
 * @param permissions - Array of permission strings to check for
 * @returns boolean - true if user has all of the permissions
 *
 * @example
 * const canFullyManageUsers = hasAllPermissions(['create users', 'edit users', 'delete users']);
 */
export function hasAllPermissions(permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;

    if (!auth?.user?.permissions || !Array.isArray(auth.user.permissions)) {
        return false;
    }

    // Check if user has all of the specified permissions
    return permissions.every((permission) => auth.user!.permissions.includes(permission));
}

/**
 * Custom hook to check if the authenticated user has a specific role
 *
 * @param role - The role string to check for
 * @returns boolean - true if user has the role, false otherwise
 *
 * @example
 * const isAdmin = hasRole('admin');
 * const isReceptionist = hasRole('receptionist');
 */
export function hasRole(role: string): boolean {
    const { auth } = usePage<SharedData>().props;

    if (!auth?.user?.roles || !Array.isArray(auth.user.roles)) {
        return false;
    }

    return auth.user.roles.includes(role);
}

/**
 * Custom hook to check if the authenticated user has any of the specified roles
 *
 * @param roles - Array of role strings to check for
 * @returns boolean - true if user has at least one of the roles
 *
 * @example
 * const canAccessAdminArea = hasAnyRole(['admin', 'manager']);
 */
export function hasAnyRole(roles: string[]): boolean {
    const { auth } = usePage<SharedData>().props;

    if (!auth?.user?.roles || !Array.isArray(auth.user.roles)) {
        return false;
    }

    return roles.some((role) => auth.user!.roles.includes(role));
}
