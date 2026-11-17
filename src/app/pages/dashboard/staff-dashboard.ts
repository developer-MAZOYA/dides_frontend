import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.services';
import { AppUser, ROLE_OPTIONS } from '../../models/auth.models';

const HIDDEN_KEYS = ['id', 'password', 'role', 'authorities'];
const NAME_KEYS = ['name', 'fullName', 'username', 'email'];

@Component({
  selector: 'app-staff-dashboard',
  template: `
    <section class="dash">
      <header class="dash-head">
        <div>
          <span class="section-tag">{{ roleLabel() }} dashboard</span>
          <h1>Users</h1>
          <p class="dash-sub">
            {{ canManageRoles() ? 'View users, edit their details and assign roles.' : 'View users and their details.' }}
          </p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-outline" type="button" [disabled]="loading()" (click)="load()">Refresh</button>
          <button class="btn btn-outline" type="button" (click)="auth.logout()">Sign out</button>
        </div>
      </header>

      <div class="dash-stats">
        <div class="dash-stat"><span>{{ total() }}</span><small>Total users</small></div>
        @for (r of roleCounts(); track r[0]) {
          <div class="dash-stat"><span>{{ r[1] }}</span><small>{{ r[0] }}</small></div>
        }
      </div>

      @if (error()) {
        <div class="dash-alert">{{ error() }}</div>
      }

      <div class="dash-layout">
        <section class="dash-card">
          <h2>All users</h2>
          <input
            class="dash-input"
            type="search"
            placeholder="Search by name, email or role…"
            (input)="query.set($any($event.target).value)"
          />

          @if (loading()) {
            <p class="dash-muted">Loading users…</p>
          } @else if (filtered().length === 0) {
            <p class="dash-muted">No users match.</p>
          } @else {
            <ul class="dash-user-list">
              @for (u of filtered(); track u.id) {
                <li [class.active]="selected()?.id === u.id">
                  <button type="button" (click)="open(u)">
                    <strong>{{ label(u) }}</strong>
                    <span class="dash-role">{{ roleOf(u) || '—' }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        <section class="dash-card">
          @if (selected(); as u) {
            <h2>{{ label(u) }}</h2>
            <p class="dash-muted">User ID {{ u.id }}</p>

            @if (canManageRoles()) {
              <div class="dash-block">
                <h3>Role</h3>
                <div class="dash-row">
                  <select class="dash-input" [value]="newRole()" (change)="newRole.set($any($event.target).value)">
                    @for (r of roleOptions; track r) {
                      <option [value]="r">{{ r }}</option>
                    }
                  </select>
                  <button
                    class="btn btn-primary"
                    type="button"
                    [disabled]="saving() || newRole() === roleOf(u)"
                    (click)="saveRole()"
                  >
                    Save role
                  </button>
                </div>
              </div>
            }

            @if (canEdit()) {
              <div class="dash-block">
                <h3>Details</h3>
                @for (k of editableKeys(u); track k) {
                  <label class="dash-edit">
                    <span>{{ k }}</span>
                    <input [value]="draft()[k] ?? ''" (input)="setDraft(k, $any($event.target).value)" />
                  </label>
                }
                <button class="btn btn-gold" type="button" [disabled]="saving()" (click)="saveProfile()">
                  Save details
                </button>
              </div>
            } @else {
              <dl class="dash-facts">
                @for (k of editableKeys(u); track k) {
                  <dt>{{ k }}</dt>
                  <dd>{{ u[k] }}</dd>
                }
              </dl>
            }

            @if (message()) {
              <p class="dash-ok">{{ message() }}</p>
            }
          } @else {
            <p class="dash-muted">Select a user to see their details.</p>
          }
        </section>
      </div>
    </section>
  `,
})
export class StaffDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private usersApi = inject(UsersService);

  readonly roleOptions = ROLE_OPTIONS;
  readonly roleLabel = computed(() => this.auth.role() || 'Staff');

  // Driven by the permissions the backend sends at login, not by role names
  readonly canManageRoles = computed(() => this.auth.can('ROLE_MANAGE'));
  readonly canEdit = computed(() => this.auth.can('USER_UPDATE'));

  users = signal<AppUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  selected = signal<AppUser | null>(null);
  draft = signal<Record<string, string>>({});
  newRole = signal('');
  saving = signal(false);
  message = signal<string | null>(null);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      Object.values(u).some(v => String(v ?? '').toLowerCase().includes(q)),
    );
  });

  total = computed(() => this.users().length);

  roleCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const u of this.users()) {
      const r = this.roleOf(u) || 'UNASSIGNED';
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return [...counts.entries()];
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.usersApi.list().subscribe({
      next: list => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 403
            ? 'You do not have permission to view users.'
            : 'Could not load users. Check that the backend is running.',
        );
      },
    });
  }

  label(u: AppUser): string {
    for (const key of NAME_KEYS) {
      const value = u[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return `User ${u.id}`;
  }

  roleOf(u: AppUser): string {
    return String(u['role'] ?? '').replace(/^ROLE_/, '').toUpperCase();
  }

  /** Fields shown in the form. Nested objects and internal fields are skipped. */
  editableKeys(u: AppUser): string[] {
    return Object.keys(u).filter(k => !HIDDEN_KEYS.includes(k) && typeof u[k] !== 'object');
  }

  open(u: AppUser) {
    this.message.set(null);
    this.error.set(null);

    this.usersApi.getById(u.id).subscribe({
      next: full => {
        this.selected.set(full);
        this.newRole.set(this.roleOf(full));

        const values: Record<string, string> = {};
        for (const k of this.editableKeys(full)) {
          values[k] = String(full[k] ?? '');
        }
        this.draft.set(values);
      },
      error: (err: HttpErrorResponse) => this.fail(err, 'Could not load this user.'),
    });
  }

  setDraft(key: string, value: string) {
    this.draft.update(d => ({ ...d, [key]: value }));
  }

  saveProfile() {
    const user = this.selected();
    if (!user) return;

    this.saving.set(true);
    this.message.set(null);

    this.usersApi.update(user.id, { ...user, ...this.draft() }).subscribe({
      next: updated => {
        this.saving.set(false);
        this.selected.set(updated);
        this.message.set('Details saved.');
        this.load();
      },
      error: (err: HttpErrorResponse) => this.fail(err, 'Could not save details.'),
    });
  }

  saveRole() {
    const user = this.selected();
    if (!user || !this.newRole()) return;

    this.saving.set(true);
    this.message.set(null);

    this.usersApi.updateRole(user.id, this.newRole()).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Role updated.');
        this.load();
        this.open(user);
      },
      error: (err: HttpErrorResponse) => this.fail(err, 'Could not update the role.'),
    });
  }

  private fail(err: HttpErrorResponse, fallback: string) {
    this.saving.set(false);
    const body = err.error as { error?: string; message?: string } | string | null;
    const serverMessage = typeof body === 'string' ? body : body?.error ?? body?.message;

    this.error.set(
      serverMessage ??
        (err.status === 403 ? 'You do not have permission for this action.' : fallback),
    );
  }
}