import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore, homePathFor } from '../services/session.store';

/** Requires a logged-in user. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(SessionStore);
  const router = inject(Router);

  if (store.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Requires one of the roles listed in route.data['roles']. */
export const roleGuard: CanActivateFn = route => {
  const store = inject(SessionStore);
  const router = inject(Router);
  const allowed = (route.data['roles'] as string[] | undefined) ?? [];

  if (!store.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  if (store.roles().some(r => allowed.includes(r))) {
    return true;
  }
  return router.createUrlTree([homePathFor(store.role())]);
};

/** Sends /dashboard to the dashboard for the user's role. */
export const dashboardGuard: CanActivateFn = () => {
  const store = inject(SessionStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  return router.createUrlTree([homePathFor(store.role())]);
};