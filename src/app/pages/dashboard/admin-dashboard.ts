import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.services';
import { AdmissionService } from '../../services/admission.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [MatIconModule, RouterLink],
  template: `
    <div class="dash-container">
      <header class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, <strong>{{ displayName() }}</strong>. Here is the system overview.</p>
      </header>

      <!-- STATS BANNER -->
      <div class="stats-banner">
        <div class="stat-box">
          <div class="stat-icon purple"><mat-icon>group</mat-icon></div>
          <div class="stat-info">
            <span>Total Users</span>
            <strong>{{ totalUsers() }}</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon gold"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <span>Pending Admissions</span>
            <strong>{{ pendingAdmissions() }}</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon green"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <span>Approved Admissions</span>
            <strong>{{ approvedAdmissions() }}</strong>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <div class="card">
            <div class="card-header">
              <h2>System Activity</h2>
              <span class="badge">Live</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Pending Review</strong><br>
                    <small>Admissions awaiting approval</small>
                  </td>
                  <td>
                    <span class="text-warning">
                      <mat-icon inline>error_outline</mat-icon> {{ pendingAdmissions() }} waiting
                    </span>
                  </td>
                  <td><a routerLink="/dashboard/admissions" class="btn-outline-sm">Review</a></td>
                </tr>
                <tr>
                  <td><strong>User Management</strong><br><small>Manage staff & students</small></td>
                  <td><span class="badge-info">Active</span></td>
                  <td><a routerLink="/dashboard/users" class="btn-outline-sm">Manage</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="side-col">
          <div class="card">
            <div class="card-header"><h2>Admin Actions</h2></div>
            <div class="action-list">
              <a routerLink="/dashboard/users" class="action-item">
                <div class="icon-blue"><mat-icon>person_add</mat-icon></div>
                <div>
                  <strong>Create New User</strong>
                  <small class="text-muted">Add a student or staff member</small>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { color: var(--navy); margin: 0 0 0.2rem 0; font-size: 1.5rem; }
    .page-header p { margin: 0; color: var(--muted); font-size: 0.9rem; }

    .stats-banner { display: flex; background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .stat-box { display: flex; align-items: center; gap: 1rem; padding: 0 2rem; border-right: 1px solid #e2e8f0; flex: 1; }
    .stat-box:last-child { border-right: none; }
    .stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.purple { background: rgba(107, 33, 168, 0.1); color: var(--purple); }
    .stat-icon.gold { background: rgba(212, 175, 55, 0.1); color: var(--gold); }
    .stat-icon.green { background: rgba(22, 101, 52, 0.1); color: #166534; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-info span { font-size: 0.85rem; color: var(--muted); }
    .stat-info strong { font-size: 1.5rem; color: var(--navy); }

    .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    .main-col, .side-col { display: flex; flex-direction: column; gap: 1.5rem; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: hidden; }
    .card-header { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .card-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }
    .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; color: var(--navy); }
    .text-warning { color: #d97706; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; }
    .badge-info { background: #e0f2fe; color: #0369a1; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .btn-outline-sm { background: white; border: 1px solid #cbd5e1; padding: 0.4rem 1rem; border-radius: 4px; font-weight: 600; color: var(--navy); font-size: 0.85rem; text-decoration: none; }
    
    .action-list { padding: 1rem; }
    .action-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 8px; text-decoration: none; border: 1px solid #e2e8f0; }
    .icon-blue { width: 40px; height: 40px; border-radius: 50%; background: #e0e7ff; color: #3730a3; display: flex; align-items: center; justify-content: center; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private usersApi = inject(UsersService);
  private admissionsApi = inject(AdmissionService);

  displayName = signal('Admin');
  totalUsers = signal(0);
  pendingAdmissions = signal(0);
  approvedAdmissions = signal(0);

  ngOnInit() {
    const name = this.auth.username();
    this.displayName.set(name.includes('@') ? name.split('@')[0] : name);

    this.usersApi.list().subscribe({
      next: (users) => this.totalUsers.set(users.length),
      error: () => console.error('Failed to load users')
    });

    this.admissionsApi.listAll().subscribe({
      next: (admissions) => {
        let pending = 0;
        let approved = 0;
        admissions.forEach(a => {
          const s = String(a.status).toUpperCase();
          if (s === 'SUBMITTED') pending++;
          if (s === 'APPROVED' || s === 'CONFIRMED') approved++;
        });
        this.pendingAdmissions.set(pending);
        this.approvedAdmissions.set(approved);
      },
      error: () => console.error('Failed to load admissions')
    });
  }
}