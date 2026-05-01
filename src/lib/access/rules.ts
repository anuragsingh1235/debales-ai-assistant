// Pure access rule functions - no DB calls, no side effects.
// These are the single source of truth for authorization logic.
import { IUser, IProject, UserRole } from '@/types';

/** Check if a user is a member of any role in a project */
export function canAccessProject(user: IUser, project: IProject): boolean {
  return project.members.some((m) => m.userId === user._id);
}

/** Get the user's role within a project */
export function getUserRoleInProject(user: IUser, project: IProject): UserRole | null {
  const member = project.members.find((m) => m.userId === user._id);
  return member?.role ?? null;
}

/** Check if user is admin of the project */
export function isProjectAdmin(user: IUser, project: IProject): boolean {
  return getUserRoleInProject(user, project) === 'admin';
}

/** Only admins can view the admin dashboard */
export function canAccessAdminDashboard(user: IUser, project: IProject): boolean {
  return isProjectAdmin(user, project);
}

/** Members and admins can create/read conversations */
export function canManageConversations(user: IUser, project: IProject): boolean {
  return canAccessProject(user, project);
}

/** Only admins can update integration settings */
export function canUpdateIntegrations(user: IUser, project: IProject): boolean {
  return isProjectAdmin(user, project);
}

/** Only admins can update dashboard config */
export function canUpdateDashboardConfig(user: IUser, project: IProject): boolean {
  return isProjectAdmin(user, project);
}
