import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppUser } from '../models/auth.models';

const BACKEND = 'http://localhost:9090';

/**
 * User IDs can exceed JavaScript's safe integer limit, so responses are read
 * as text and long numeric IDs are quoted before parsing. Every ID stays a string.
 */
function parseSafe(raw: string): unknown {
  const safe = raw.replace(/"(id|userId|user_id)"\s*:\s*(\d{10,})/g, '"$1":"$2"');
  return JSON.parse(safe);
}

/** Gives every user a single string `id` field, whatever the backend calls it. */
function normalise(u: Record<string, unknown>): AppUser {
  return {
    ...u,
    id: String(u['id'] ?? u['userId'] ?? u['user_id'] ?? ''),
  } as AppUser;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  /** GET /list-All. Requires USER_READ. */
  list(): Observable<AppUser[]> {
    return this.http.get(`${BACKEND}/list-All`, { responseType: 'text' }).pipe(
      map(raw => (parseSafe(raw) as Record<string, unknown>[]).map(normalise)),
    );
  }

  /** GET /get-user/{id}. Requires USER_READ or being the user themselves. */
  getById(id: string): Observable<AppUser> {
    return this.http.get(`${BACKEND}/get-user/${id}`, { responseType: 'text' }).pipe(
      map(raw => normalise(parseSafe(raw) as Record<string, unknown>)),
    );
  }

  /** POST /admin/users. Creates a user with a specific role. Requires USER_CREATE. */
  create(data: any): Observable<AppUser> {
    return this.http.post(`${BACKEND}/admin/users`, data, { responseType: 'text' }).pipe(
      map(raw => normalise(parseSafe(raw) as Record<string, unknown>))
    );
  }

  /** PUT /update-user/{id}. Requires USER_UPDATE. */
  update(id: string, user: AppUser): Observable<AppUser> {
    const fields: Record<string, unknown> = { ...user };
    delete fields['id'];
    
    // If password is empty in the form, remove it so the backend doesn't overwrite it with blank
    if (!fields['password']) {
      delete fields['password'];
    }

    return this.http.put(`${BACKEND}/update-user/${id}`, fields, { responseType: 'text' }).pipe(
      map(raw => normalise(parseSafe(raw) as Record<string, unknown>)),
    );
  }

  /** PUT /admin/users/{id}/role. Requires ROLE_MANAGE. */
  updateRole(id: number | string, role: string): Observable<AppUser> {
    return this.http.put(
      `${BACKEND}/admin/users/${id}/role`,
      { role },
      { responseType: 'text' },
    ).pipe(
      map(raw => normalise(parseSafe(raw) as Record<string, unknown>)),
    );
  }
}