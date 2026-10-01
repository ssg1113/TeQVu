// Dedicated Admin Governance & Access Control Module
// Enforces strict role isolation: Primary Admin is sgdesilva1113@gmail.com.
// Only sgdesilva1113@gmail.com can assign other users as admin.
// Only users with admin authority can switch to the admin role.

export const PRIMARY_ADMIN_EMAIL = 'sgdesilva1113@gmail.com';
export const ADMIN_EMAIL = PRIMARY_ADMIN_EMAIL;
export const ADMIN_NAME = 'Platform Administrator';

/**
 * Checks if the provided email is the Super/Primary Administrator.
 */
export function isPrimaryAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}

/**
 * Checks if the provided email matches an authorized admin account
 * (either the primary admin sgdesilva1113@gmail.com or an assigned admin).
 */
export function isAdminAccount(email?: string | null, assignedAdmins: string[] = []): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) return true;

  return assignedAdmins.some((admin) => admin.trim().toLowerCase() === cleanEmail);
}

/**
 * Determines whether the user possesses the authority to switch roles.
 * ONLY assigned admins or the primary admin have authority to switch to/from the admin role.
 * Normal users can NEVER switch or escalate to admin.
 */
export function canSwitchRole(
  email?: string | null,
  role?: string,
  assignedAdmins: string[] = []
): boolean {
  return isAdminAccount(email, assignedAdmins);
}
