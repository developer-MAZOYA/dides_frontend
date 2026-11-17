import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore, homePathFor } from '../services/session.store';

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(SessionStore);
  const router = inject(Router);

  if (store.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route, state) => {
  const store = inject(SessionStore);
  const router = inject(Router);
  const allowed = (route.data['roles'] as string[] | undefined) ?? [];

  if (!store.isLoggedIn()) return router.createUrlTree(['/login']);

  // ✅ Debug: Print what the guard sees
  console.log('[roleGuard] User roles:', store.roles(), '| Allowed:', allowed, '| URL:', state.url);

  // If no roles are specified, allow anyone logged in
  if (allowed.length === 0) return true;

  // Check if the user has ANY of the required roles
  const hasRole = store.roles().some(r => allowed.includes(r)) || allowed.includes(store.role());
  
  if (hasRole) return true;

  // If they don't have the role, send them to their home page
  const home = homePathFor(store.role());
  
  // ✅ Prevent infinite loop: if they're already at home, let them stay
  if (state.url === home || state.url.startsWith(home)) {
    return true;
  }
  
  return router.createUrlTree([home]);
};

export const dashboardGuard: CanActivateFn = (route, state) => {
  const store = inject(SessionStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) return router.createUrlTree(['/login']);
  
  const home = homePathFor(store.role());
  // If we're already at home, let the request pass to the next route
  if (state.url === home || state.url.startsWith(home)) {
    return true;
  }
  
  return router.createUrlTree([home]);
};

export const permissionGuard: CanActivateFn = (route, state) => {
  const store = inject(SessionStore);
  const router = inject(Router);
  
  if (!store.isLoggedIn()) return router.createUrlTree(['/login']);

  const required = (route.data['permissions'] as string[]) ?? [];
  if (required.length === 0) return true;

  const hasPermission = required.some(p => store.can(p));
  if (hasPermission) return true;

  const home = homePathFor(store.role());
  if (state.url === home) return true;
  return router.createUrlTree([home]);
};