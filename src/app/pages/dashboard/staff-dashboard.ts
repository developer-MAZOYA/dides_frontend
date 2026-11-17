import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.services';
import { AppUser, ROLE_OPTIONS } from '../../models/auth.models';
import { MatIconModule } from '@angular/material/icon';

// A list of permissions to display in the UI (you can sync this with backend enums)
const ALL_PERMISSIONS = [
  'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
  'ROLE_MANAGE', 'ADMISSION_READ', 'ADMISSION_CREATE', 'ADMISSION_UPDATE', 'ADMISSION_DELETE',
  'ADMISSION_APPROVE', 'COURSE_READ', 'COURSE_CREATE', 'REPORT_VIEW', 'AUDIT_VIEW'
];

@Component({
  selector: 'app-staff-dashboard',
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="dashboard-header">
      <div>
        <h1>User Management</h1>
        <p class="text-muted">View, create, and manage system access.</p>
      </div>
      <div class="header-actions">
        @if (canCreate()) {
          <button class="btn-primary" (click)="openCreateModal()">
            + Create User
          </button>
        }
        <button class="btn-outline" (click)="load()" [disabled]="loading()">Refresh</button>
      </div>
    </div>

    <!-- USER TABLE -->
    <div class="panel">
      <div class="panel-header">
        <h2>All Users</h2>
        <input class="search-input" type="search" placeholder="Search..." (input)="query.set($any($event.target).value)" />
      </div>

      @if (error()) { <div class="alert">{{ error() }}</div> }

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered(); track u.id) {
              <tr [class.active-row]="selected()?.id === u.id" (click)="openManagePanel(u)">
                <td><strong>{{ label(u) }}</strong></td>
                <td>{{ u['email'] || '—' }}</td>
                <td><span class="badge">{{ roleOf(u) }}</span></td>
                <td><button class="btn-sm">Manage</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- MANAGE PANEL (Existing) -->
    @if (selected(); as u) {
      <div class="panel decision-panel">
        <div class="panel-header">
          <h2>Manage: {{ label(u) }}</h2>
          <button class="btn-close" (click)="selected.set(null)">✕</button>
        </div>
        
        <div class="decision-content">
          @if (canManageRoles()) {
            <div class="form-group">
              <label>Assign Role</label>
              <div class="input-group">
                <select class="input-full" [ngModel]="newRole()" (ngModelChange)="newRole.set($event)">
                  @for (r of roleOptions; track r) { <option [value]="r">{{ r }}</option> }
                </select>
                <button class="btn-primary" [disabled]="saving() || newRole() === roleOf(u)" (click)="saveRole()">Update Role</button>
              </div>
            </div>
          }

          @if (canEdit()) {
            <div class="form-group" style="margin-top: 2rem;">
              <label>Edit Details</label>
              @for (k of editableKeys(u); track k) {
                <div class="input-group" style="margin-bottom: 0.5rem;">
                  <span style="width: 100px; text-transform: capitalize;">{{ k }}</span>
                  <input 
                    class="input-full" 
                    [type]="k === 'password' ? 'password' : 'text'"
                    [placeholder]="k === 'password' ? 'Leave blank to keep current' : ''"
                    [value]="draft()[k] ?? ''" 
                    (input)="setDraft(k, $any($event.target).value)" 
                  />
                </div>
              }
              <button class="btn-approve" style="margin-top: 1rem;" [disabled]="saving()" (click)="saveProfile()">Save Changes</button>
            </div>
          }
        </div>
      </div>
    }

    <!-- ✅ CREATE USER MODAL (POPUP) -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="closeCreateModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <h2>Create New User</h2>
            <button class="btn-close" (click)="closeCreateModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field">
                <label>First Name</label>
                <input class="input-full" placeholder="Enter first name" [(ngModel)]="newUser.firstname" />
              </div>
              <div class="form-field">
                <label>Last Name</label>
                <input class="input-full" placeholder="Enter last name" [(ngModel)]="newUser.lastname" />
              </div>
              <div class="form-field full-width">
                <label>Email</label>
                <input class="input-full" type="email" placeholder="Enter email" [(ngModel)]="newUser.email" />
              </div>
              <div class="form-field full-width">
                <label>Password</label>
                <input class="input-full" type="password" placeholder="Enter password" [(ngModel)]="newUser.password" />
              </div>
              <div class="form-field full-width">
                <label>Role</label>
                <select class="input-full" [(ngModel)]="newUser.role">
                  @for (r of roleOptions; track r) { <option [value]="r">{{ r }}</option> }
                </select>
              </div>
            </div>

            <div class="permissions-section">
              <label>Assign Permissions (Scroll for more)</label>
              <div class="permissions-scroll-box">
                @for (p of allPermissions; track p) {
                  <label class="perm-checkbox">
                    <input 
                      type="checkbox" 
                      [value]="p" 
                      (change)="togglePermission(p, $any($event.target).checked)" 
                      [checked]="newUser.permissions.includes(p)" 
                    />
                    {{ p }}
                  </label>
                }
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-outline" (click)="closeCreateModal()">Cancel</button>
            <button class="btn-approve" (click)="createUser()" [disabled]="saving()">Save User</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-actions { display: flex; gap: 1rem; }
    h1 { color: var(--navy); font-size: 1.8rem; margin: 0; }
    .text-muted { color: var(--muted); font-size: 0.9rem; margin: 0.2rem 0 0; }
    
    .panel { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 1.5rem; }
    .panel-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .panel-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    .search-input { padding: 0.6rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; width: 250px; outline: none; }

    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--muted); background: var(--pale); }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: var(--navy); }
    tr { cursor: pointer; transition: background 0.2s; }
    tr:hover { background: #f8fafc; }
    .active-row { background: #f0fdf4 !important; }

    .badge { background: var(--pale); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: var(--navy); }
    .decision-panel { border: 2px solid var(--purple); }
    .decision-content { padding: 1.5rem; }
    .form-group label { display: block; font-weight: 600; color: var(--navy); margin-bottom: 0.5rem; }
    .input-group { display: flex; gap: 1rem; align-items: center; }
    .input-full { flex: 1; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; width: 100%; box-sizing: border-box; }
    
    .btn-primary { background: var(--purple); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-approve { background: #166534; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-sm { background: var(--pale); border: none; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
    .alert { background: #fee2e2; color: #991b1b; padding: 1rem; margin: 1rem 1.5rem; border-radius: 6px; }

    /* ✅ MODAL STYLES */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: white; border-radius: 12px; width: 100%; max-width: 600px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;
      max-height: 90vh;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem; border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; color: var(--navy); }
    
    .modal-body { padding: 1.5rem; overflow-y: auto; }
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-field.full-width { grid-column: span 2; }
    .form-field label { font-size: 0.85rem; font-weight: 600; color: var(--navy); }
    
    /* ✅ PERMISSIONS SCROLLBOX */
    .permissions-section { margin-top: 1.5rem; }
    .permissions-section label { font-size: 0.85rem; font-weight: 600; color: var(--navy); display: block; margin-bottom: 0.5rem; }
    .permissions-scroll-box {
      border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem;
      height: 150px; overflow-y: auto; background: #f8fafc;
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;
    }
    
    /* Custom scrollbar for permissions */
    .permissions-scroll-box::-webkit-scrollbar { width: 6px; }
    .permissions-scroll-box::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    .perm-checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--navy); cursor: pointer; }
    .perm-checkbox input { cursor: pointer; }

    .modal-footer {
      padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem;
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private usersApi = inject(UsersService);

  readonly roleOptions = ROLE_OPTIONS;
  readonly allPermissions = ALL_PERMISSIONS;
  
  readonly canManageRoles = computed(() => this.auth.can('ROLE_MANAGE'));
  readonly canEdit = computed(() => this.auth.can('USER_UPDATE'));
  readonly canCreate = computed(() => this.auth.can('USER_CREATE'));

  users = signal<AppUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  selected = signal<AppUser | null>(null);
  draft = signal<Record<string, string>>({});
  newRole = signal('');
  saving = signal(false);
  message = signal<string | null>(null);

  // Create State
  showCreateModal = signal(false);
  newUser = { 
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '', 
    role: 'STUDENT',
    permissions: [] as string[] // ✅ Added permissions array
  };

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.users().filter(u => !q || Object.values(u).some(v => String(v ?? '').toLowerCase().includes(q)));
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.usersApi.list().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: () => { this.error.set('Could not load users.'); this.loading.set(false); }
    });
  }

  // --- CREATE LOGIC ---
  openCreateModal() {
    this.newUser = { firstname: '', lastname: '', email: '', password: '', role: 'STUDENT', permissions: [] };
    this.showCreateModal.set(true);
    this.error.set(null);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  togglePermission(perm: string, checked: boolean) {
    if (checked) {
      if (!this.newUser.permissions.includes(perm)) this.newUser.permissions.push(perm);
    } else {
      this.newUser.permissions = this.newUser.permissions.filter(p => p !== perm);
    }
  }

  createUser() {
    this.saving.set(true);
    this.error.set(null);
    
    this.usersApi.create(this.newUser).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreateModal();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || err.error?.error || 'Failed to create user.');
        console.error('Create user failed:', err);
      }
    });
  }

  // --- MANAGE LOGIC ---
  label(u: AppUser): string { return String(u['firstname'] ?? u['name'] ?? u['username'] ?? 'User'); }
  roleOf(u: AppUser): string { return String(u['role'] ?? '').replace(/^ROLE_/, '').toUpperCase(); }
  editableKeys(u: AppUser): string[] { return Object.keys(u).filter(k => !['id','role','authorities'].includes(k) && typeof u[k] !== 'object'); }

  openManagePanel(u: AppUser) {
    this.message.set(null);
    this.error.set(null);
    this.selected.set(u);
    this.newRole.set(this.roleOf(u));
    const values: Record<string, string> = {};
    for (const k of this.editableKeys(u)) { 
      values[k] = k === 'password' ? '' : String(u[k] ?? ''); 
    }
    this.draft.set(values);
  }

  setDraft(key: string, val: string) { this.draft.update(d => ({ ...d, [key]: val })); }

  saveProfile() {
    const u = this.selected();
    if (!u) return;
    this.saving.set(true);
    this.error.set(null);
    
    const payload = { ...u, ...this.draft() };
    
    this.usersApi.update(u.id, payload).subscribe({
      next: upd => { 
        this.saving.set(false); 
        this.selected.set(upd); 
        this.message.set('Details saved.'); 
        this.load(); 
      },
      error: (err) => { 
        this.saving.set(false); 
        this.error.set(err.error?.message || 'Failed to save.'); 
      }
    });
  }

  saveRole() {
    const u = this.selected();
    if (!u || !this.newRole()) return;
    this.saving.set(true);
    this.error.set(null);
    
    this.usersApi.updateRole(u.id, this.newRole()).subscribe({
      next: () => { 
        this.saving.set(false); 
        this.message.set('Role updated.'); 
        this.load(); 
        this.openManagePanel(u); 
      },
      error: (err) => { 
        this.saving.set(false); 
        this.error.set(err.error?.message || 'Failed to update role.'); 
      }
    });
  }
}