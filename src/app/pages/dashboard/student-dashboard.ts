import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  imports: [MatIconModule, RouterLink],
  template: `
    <div class="dash-container">
      <!-- 1. GREETING HEADER -->
      <header class="page-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, <strong>{{ displayName() }}</strong>!</p>
      </header>

      <!-- 2. STATS BANNER (Matches SRMS top row) -->
      <div class="stats-banner">
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>laptop_mac</mat-icon></div>
          <div class="stat-info">
            <span>Total Courses Registered</span>
            <strong>0</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>lightbulb_outline</mat-icon></div>
          <div class="stat-info">
            <span>Registered Semester</span>
            <strong>0 / 2</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>verified</mat-icon></div>
          <div class="stat-info">
            <span>Course Completed</span>
            <strong>0 / 0</strong>
          </div>
        </div>
        
        <!-- GPA Circle (Mocked for now) -->
        <div class="stat-box gpa-box">
          <div class="gpa-circle">
            <span>Overall</span>
            <strong>3.3</strong>
            <span>Out of 5.0</span>
          </div>
        </div>
      </div>

      <!-- 3. MAIN CONTENT GRID -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="main-col">
          <!-- Online Registration (Matches SRMS table) -->
          <div class="card">
            <div class="card-header">
              <h2>Online Registration</h2>
              <span class="badge">Academic Year: 2026/2027</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>SEMESTER</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>SEMESTER ONE</strong><br>
                    <small>Nov 9, 2026 - Nov 18, 2026</small>
                  </td>
                  <td>
                    <span class="text-danger"><mat-icon inline>error_outline</mat-icon> You are not registered</span>
                  </td>
                  <td>
                    <button class="btn-outline-sm">Register</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>SEMESTER TWO</strong></td>
                  <td><span class="badge-warning">Not Available</span></td>
                  <td><button class="btn-disabled" disabled>Unavailable</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tabs (Matches SRMS bottom section) -->
          <div class="card">
            <div class="tabs">
              <button class="tab active">My Information</button>
              <button class="tab">Payment Details</button>
              <button class="tab">Loan Details</button>
            </div>
            <div class="tab-content">
              <p>Student details will appear here.</p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="side-col">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header"><h2>Quick Actions</h2></div>
            <div class="action-list">
              <a routerLink="/portal/forms" class="action-item">
                <div class="icon-green"><mat-icon>person_add</mat-icon></div>
                <div>
                  <strong>Verify Your Information</strong>
                  <small class="text-success">Verification Completed (100%)</small>
                </div>
              </a>
            </div>
          </div>

          <!-- Permissions -->
          <div class="card empty-card">
            <h3 class="text-primary">No Permission Requests</h3>
            <p class="text-muted">You don't have any permission requests at the moment.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1200px; margin: 0 auto; }

    /* Header */
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { color: var(--navy); margin: 0 0 0.2rem 0; font-size: 1.5rem; }
    .page-header p { margin: 0; color: var(--muted); font-size: 0.9rem; }

    /* Stats Banner */
    .stats-banner { display: flex; background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1.5rem; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .stat-box { display: flex; align-items: center; gap: 1rem; padding: 0 1rem; border-right: 1px solid #e2e8f0; }
    .stat-box:last-child { border-right: none; }
    .stat-icon { width: 50px; height: 50px; border-radius: 8px; background: rgba(107, 33, 168, 0.1); color: var(--purple); display: flex; align-items: center; justify-content: center; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-info span { font-size: 0.85rem; color: var(--muted); }
    .stat-info strong { font-size: 1.5rem; color: var(--navy); }

    .gpa-box { flex: 1; justify-content: flex-end; }
    .gpa-circle { width: 100px; height: 100px; border-radius: 50%; border: 8px solid #38bdf8; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .gpa-circle span { font-size: 0.6rem; text-transform: uppercase; color: var(--muted); }
    .gpa-circle strong { font-size: 1.4rem; color: var(--navy); line-height: 1; }

    /* Layout Grid */
    .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    .main-col { display: flex; flex-direction: column; gap: 1.5rem; }
    .side-col { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Cards */
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: hidden; }
    .card-header { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .card-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    .badge { background: #f1f5f9; color: var(--navy); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }

    /* Data Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }
    .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; color: var(--navy); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table small { color: var(--muted); font-size: 0.8rem; }
    .text-danger { color: #b91c1c; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; }
    
    .badge-warning { background: #f59e0b; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .btn-outline-sm { background: white; border: 1px solid #cbd5e1; padding: 0.4rem 1rem; border-radius: 4px; font-weight: 600; cursor: pointer; color: var(--navy); font-size: 0.85rem; }
    .btn-disabled { background: #f1f5f9; border: none; padding: 0.4rem 1rem; border-radius: 4px; color: var(--muted); font-size: 0.85rem; }

    /* Tabs */
    .tabs { display: flex; border-bottom: 2px solid #e2e8f0; padding: 0 1.5rem; }
    .tab { background: none; border: none; padding: 1rem 0; margin-right: 2rem; font-weight: 600; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tab.active { color: #2563eb; border-bottom-color: #2563eb; }
    .tab-content { padding: 1.5rem; min-height: 100px; }

    /* Quick Actions */
    .action-list { padding: 1rem; }
    .action-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 8px; text-decoration: none; color: var(--navy); transition: background 0.2s; border: 1px solid #e2e8f0; }
    .action-item:hover { background: #f8fafc; }
    .icon-green { width: 40px; height: 40px; border-radius: 50%; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; }
    .action-item strong { display: block; font-size: 0.9rem; }
    .action-item small { font-size: 0.8rem; }
    .text-success { color: #166534; }

    /* Empty Card */
    .empty-card { padding: 2rem 1.5rem; text-align: center; }
    .text-primary { color: #2563eb; margin: 0 0 0.5rem 0; font-size: 1rem; }
    .text-muted { color: var(--muted); font-size: 0.85rem; line-height: 1.5; margin: 0; }

    @media (max-width: 900px) {
      .content-grid { grid-template-columns: 1fr; }
      .stats-banner { flex-direction: column; align-items: stretch; }
      .stat-box { border-right: none; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; }
      .gpa-box { align-items: flex-start; }
    }
  `]
})
export class StudentDashboardComponent {
  readonly auth = inject(AuthService);

  readonly displayName = computed(() => {
    const name = this.auth.username();
    return name.includes('@') ? name.split('@')[0] : name;
  });
}