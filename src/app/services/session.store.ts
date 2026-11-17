import { Injectable, computed, signal } from '@angular/core';
import { Session } from '../models/auth.models';

const KEY = 'dides.session';

const PRIORITY = ['ADMIN', 'DIRECTOR', 'ADMISSIONUSER', 'STAFF', 'STUDENT'];

export function normaliseRoles(roles: string[] | null | undefined): string[] {
  return (roles ?? []).map(r => r.replace(/^ROLE_/, '').toUpperCase());
}

export function primaryRole(roles: string[]): string {
  return PRIORITY.find(p => roles.includes(p)) ?? roles[0] ?? '';
}

export function homePathFor(role: string): string {
  switch (role?.toUpperCase()) {
    case 'STUDENT':
      return '/dashboard/student';
    case 'ADMIN':
    case 'DIRECTOR':
    case 'ADMISSIONUSER':
    case 'STAFF':
      return '/dashboard/users'; 
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