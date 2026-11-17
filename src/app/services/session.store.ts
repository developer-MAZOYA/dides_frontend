import { Injectable, computed, signal } from '@angular/core';
import { Session } from '../models/auth.models';

const KEY = 'dides.session';

/** If a user somehow has several roles, the most senior one decides the dashboard. */
const PRIORITY = ['ADMIN', 'DIRECTOR', 'ADMISSIONUSER', 'STAFF', 'STUDENT'];

export function normaliseRoles(roles: string[] | null | undefined): string[] {
  return (roles ?? []).map(r => r.replace(/^ROLE_/, '').toUpperCase());
}

export function primaryRole(roles: string[]): string {
  return PRIORITY.find(p => roles.includes(p)) ?? roles[0] ?? '';
}

/** Returns the dashboard a role should land on. */
export function homePathFor(role: string): string {
  switch (role) {
    case 'STUDENT':
      return '/dashboard/student';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'DIRECTOR':
      return '/dashboard/director';
    default:
      return '/portal';
  }
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private state = signal<Session | null>(this.read());

  readonly token = computed(() => this.state()?.token ?? null);
  readonly username = computed(() => this.state()?.username ?? '');
  readonly role = computed(() => this.state()?.role ?? '');
  readonly roles = computed(() => this.state()?.roles ?? []);
  readonly permissions = computed(() => this.state()?.permissions ?? []);
  readonly isLoggedIn = computed(() => !!this.state()?.token);

  /** True if the logged-in user holds the permission, e.g. can('USER_UPDATE'). */
  can(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  save(session: Session) {
    localStorage.setItem(KEY, JSON.stringify(session));
    this.state.set(session);
  }

  clear() {
    localStorage.removeItem(KEY);
    this.state.set(null);
  }

  private read(): Session | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}