import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { LoginRequest, LoginResponse, Session } from '../models/auth.models';
import { SessionStore, homePathFor, normaliseRoles, primaryRole } from './session.store';

const BACKEND = 'http://localhost:9090';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(SessionStore);
  private router = inject(Router);

  readonly role = this.store.role;
  readonly roles = this.store.roles;
  readonly username = this.store.username;
  readonly isLoggedIn = this.store.isLoggedIn;

  can(permission: string): boolean {
    return this.store.can(permission);
  }

  login(email: string, password: string): Observable<Session> {
    const body: LoginRequest = { email: email.trim().toLowerCase(), password };

    return this.http.post<LoginResponse>(`${BACKEND}/auth/login`, body).pipe(
      map(res => {
        if (!res.token) {
          throw new Error('The server did not return a token.');
        }

        const roles = normaliseRoles(res.roles);
        const session: Session = {
          token: res.token,
          username: body.email,
          roles,
          role: primaryRole(roles),
          permissions: res.permissions ?? [],
        };

        this.store.save(session);
        return session;
      }),
    );
  }

  logout() {
    this.store.clear();
    this.router.navigateByUrl('/login');
  }

  homePath(): string {
    return homePathFor(this.role());
  }
}