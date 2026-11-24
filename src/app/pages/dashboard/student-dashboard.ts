import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AcademicService } from '../../services/academic.service';

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

      <!-- 2. STATS BANNER -->
      <div class="stats-banner">
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>laptop_mac</mat-icon></div>
          <div class="stat-info">
            <span>Registered Subjects</span>
            <strong>{{ subjects().length }}</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>lightbulb_outline</mat-icon></div>
          <div class="stat-info">
            <span>Current Semester</span>
            <strong>{{ gpa()?.semester ?? 1 }} / 2</strong>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon"><mat-icon>verified</mat-icon></div>
          <div class="stat-info">
            <span>Completed Subjects</span>
            <strong>{{ results().length }}</strong>
          </div>
        </div>

        <!-- GPA Circle -->
        <div class="stat-box gpa-box">
          <div class="gpa-circle">
            <span>Overall</span>
            <strong>{{ gpa()?.cumulativeGpa ?? '0.00' }}</strong>
            <span>Out of 5.0</span>
          </div>
        </div>
      </div>

      <!-- 3. MAIN CONTENT GRID -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="main-col">
          <!-- My Subjects -->
          <div class="card">
            <div class="card-header">
              <h2>My Subjects This Semester</h2>
              <span class="badge">Academic Year {{ currentYear }}</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>SUBJECT</th>
                  <th>CREDITS</th>
                </tr>
              </thead>
              <tbody>
                @for (s of subjects(); track s.id) {
                  <tr>
                    <td><span class="badge-code">{{ s.code }}</span></td>
                    <td><strong>{{ s.name }}</strong></td>
                    <td>{{ s.credits }} Credits</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="empty-state">
                      No subjects registered yet. Check back after registration opens.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Recent Results -->
          <div class="card">
            <div class="card-header">
              <h2>Recent Results</h2>
              <a routerLink="/dashboard/student/academics" class="link-more">View All →</a>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>SUBJECT</th>
                  <th>FINAL SCORE</th>
                  <th>GRADE</th>
                  <th>GPA</th>
                </tr>
              </thead>
              <tbody>
                @for (r of results().slice(0, 5); track r.id) {
                  <tr>
                    <td><strong>{{ r.subject?.name }}</strong></td>
                    <td>{{ r.finalScore }}%</td>
                    <td>
                      <span class="grade-badge" [class]="'grade-' + (r.grade || 'F')">
                        {{ r.grade || '—' }}
                      </span>
                    </td>
                    <td>{{ r.gradePoint ?? '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">
                      No results published yet. Grades will appear once finalized.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column -->
        <div class="side-col">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header"><h2>Quick Links</h2></div>
            <div class="action-list">
              <a routerLink="/dashboard/student/academics" class="action-item">
                <div class="icon-purple"><mat-icon>school</mat-icon></div>
                <div>
                  <strong>My Academic Record</strong>
                  <small>View full grades &amp; GPA</small>
                </div>
              </a>
              <a routerLink="/portal/forms" class="action-item" style="margin-top: 0.5rem;">
                <div class="icon-green"><mat-icon>description</mat-icon></div>
                <div>
                  <strong>Forms &amp; Documents</strong>
                  <small>Download official forms</small>
                </div>
              </a>
              <a routerLink="/contact" class="action-item" style="margin-top: 0.5rem;">
                <div class="icon-gold"><mat-icon>support_agent</mat-icon></div>
                <div>
                  <strong>Contact Help Desk</strong>
                  <small>Get support</small>
                </div>
              </a>
            </div>
          </div>

          <!-- Notice Board -->
          <div class="card empty-card">
            <h3 class="text-primary">No Pending Notices</h3>
            <p class="text-muted">You're all caught up. Check back for announcements.</p>
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
    .link-more { color: var(--purple); text-decoration: none; font-size: 0.85rem; font-weight: 600; }

    /* Data Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }
    .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; color: var(--navy); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .badge-code { background: var(--pale); color: var(--navy); font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }

    /* Grade badges */
    .grade-badge { display: inline-block; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem; }
    .grade-A { background: #dcfce7; color: #166534; }
    .grade-B { background: #dbeafe; color: #1e40af; }
    .grade-C { background: #fef9c3; color: #854d0e; }
    .grade-D { background: #ffedd5; color: #9a3412; }
    .grade-F { background: #fee2e2; color: #991b1b; }

    /* Quick Actions */
    .action-list { padding: 1rem; }
    .action-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 8px; text-decoration: none; color: var(--navy); transition: background 0.2s; border: 1px solid #e2e8f0; }
    .action-item:hover { background: #f8fafc; }
    .icon-purple { width: 40px; height: 40px; border-radius: 50%; background: rgba(107, 33, 168, 0.1); color: var(--purple); display: flex; align-items: center; justify-content: center; }
    .icon-green { width: 40px; height: 40px; border-radius: 50%; background: #dcfce7; color: #166534; display: flex; align-items: center; justify-content: center; }
    .icon-gold { width: 40px; height: 40px; border-radius: 50%; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; }
    .action-item strong { display: block; font-size: 0.9rem; }
    .action-item small { font-size: 0.8rem; color: var(--muted); }

    /* Empty Card */
    .empty-card { padding: 2rem 1.5rem; text-align: center; }
    .text-primary { color: #2563eb; margin: 0 0 0.5rem 0; font-size: 1rem; }
    .text-muted { color: var(--muted); font-size: 0.85rem; line-height: 1.5; margin: 0; }
    .empty-state { text-align: center; color: var(--muted); padding: 2rem !important; font-style: italic; font-size: 0.85rem; }

    @media (max-width: 900px) {
      .content-grid { grid-template-columns: 1fr; }
      .stats-banner { flex-direction: column; align-items: stretch; }
      .stat-box { border-right: none; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; }
      .gpa-box { align-items: flex-start; }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private academicApi = inject(AcademicService);

  readonly currentYear = new Date().getFullYear();

  readonly displayName = computed(() => {
    const name = this.auth.username();
    return name.includes('@') ? name.split('@')[0] : name;
  });

  // Academic data — no more admission references
  subjects = signal<any[]>([]);
  results = signal<any[]>([]);
  gpa = signal<any>(null);

  ngOnInit() {
    this.academicApi.getMySubjects().subscribe(s => this.subjects.set(s));
    this.academicApi.getMyResults().subscribe(r => this.results.set(r));
    this.academicApi.getMyGpa().subscribe(g => this.gpa.set(g));
  }
}