/**
 * Role-based access control.
 * Matches Supabase user_roles.user_role enum: 'admin' | 'kitchen' | 'cashier'
 */
export type UserRole = 'admin' | 'kitchen' | 'cashier';

/** Routes each role can access */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ['/pos', '/tables', '/reports', '/products', '/raw-materials', '/settings'],
  kitchen: ['/products', '/tables', '/raw-materials'],
  cashier: ['/pos', '/tables', '/reports', '/products', '/settings'],
};

/** Default route to redirect to when user has no access to current page */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  admin: '/pos',
  kitchen: '/tables',
  cashier: '/pos',
};

/** Default role when user has no row in user_roles */
export const DEFAULT_ROLE: UserRole = 'cashier';

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role];
  if (!allowed) return false;
  return allowed.some((route) => pathname === route || (route !== '/pos' && pathname.startsWith(route)));
}

export function getDefaultRoute(role: UserRole): string {
  return ROLE_DEFAULT_ROUTE[role] ?? '/pos';
}
