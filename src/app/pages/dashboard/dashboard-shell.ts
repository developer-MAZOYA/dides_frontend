import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="shell" [class.nav-open]="menuOpen()">
      <aside class="sidebar">
        <div class="brand">
          <img src="/dides.png" alt="DIDES logo" class="logo" />
          <div>
            <strong>DIDES</strong>
            <small>{{ roleTitle() }} Portal</small>
          </div>
        </div>

        <nav class="side-nav">
          <!-- ==============================
               HOME LINK
               ============================== -->
          @if (auth.role() === 'STUDENT') {
            <a routerLink="/dashboard/student" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>home</mat-icon> My Dashboard
            </a>
          } @else {
            <a routerLink="/dashboard/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>dashboard</mat-icon> Admin Dashboard
            </a>
          }

          <!-- ==============================
               STUDENT MENUS
               ============================== -->
          @if (auth.role() === 'STUDENT') {
            <!-- Academics -->
            <div class="nav-item-group">
              <button class="nav-btn" (click)="toggleGroup('academics')" [class.expanded]="expandedGroups().includes('academics')">
                <mat-icon>menu_book</mat-icon> Academics
                <mat-icon class="chevron">expand_more</mat-icon>
              </button>
              <div class="sub-menu" [class.open]="expandedGroups().includes('academics')">
                <a routerLink="/dashboard/student/academics" routerLinkActive="active">My Academic Record</a>
              </div>
            </div>

            <!-- Finance -->
            <div class="nav-item-group">
              <button class="nav-btn" (click)="toggleGroup('finance')" [class.expanded]="expandedGroups().includes('finance')">
                <mat-icon>payments</mat-icon> Finance
                <mat-icon class="chevron">expand_more</mat-icon>
              </button>
              <div class="sub-menu" [class.open]="expandedGroups().includes('finance')">
                <a routerLink="/dashboard/student/fees" routerLinkActive="active">Fee Statement</a>
                <a routerLink="/dashboard/student/payments" routerLinkActive="active">Payment History</a>
              </div>
            </div>
          }

          <!-- ==============================
               ADMIN MENUS
               ============================== -->
          @if (auth.can('COURSE_CREATE')) {
            <div class="nav-item-group">
              <button class="nav-btn" (click)="toggleGroup('academic-setup')" [class.expanded]="expandedGroups().includes('academic-setup')">
                <mat-icon>school</mat-icon> Academic Setup
                <mat-icon class="chevron">expand_more</mat-icon>
              </button>
              <div class="sub-menu" [class.open]="expandedGroups().includes('academic-setup')">
                <a routerLink="/dashboard/admin/subjects" routerLinkActive="active">Manage Subjects</a>
                <a routerLink="/dashboard/admin/grades" routerLinkActive="active">Enter Grades</a>
              </div>
            </div>
          }

          <!-- Users -->
          @if (auth.can('USER_READ')) {
            <a routerLink="/dashboard/users" routerLinkActive="active">
              <mat-icon>group</mat-icon> User Management
            </a>
          }

          <!-- Admissions (only for staff with ADMISSION_READ) -->
          @if (auth.can('ADMISSION_READ')) {
            <a routerLink="/dashboard/admissions" routerLinkActive="active">
              <mat-icon>fact_check</mat-icon> Admissions
            </a>
          }
        </nav>

        <div class="side-foot">
          <div class="user-profile">
            <div class="avatar">{{ auth.username().charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <strong>{{ auth.username() }}</strong>
              <small>{{ roleTitle() }}</small>
            </div>
          </div>
          <button type="button" class="btn-logout" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sign out
          </button>
        </div>
      </aside>

      <div class="scrim" (click)="menuOpen.set(false)"></div>

      <main class="main">
        <header class="topbar">
          <button class="menu-btn" (click)="menuOpen.set(!menuOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="top-actions">
            <a routerLink="/" class="site-link">
              <mat-icon>language</mat-icon> <span>Public Site</span>
            </a>
          </div>
        </header>

        <div class="content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; background: var(--pale, #f4f7f9); font-family: 'Inter', sans-serif; }

    /* SIDEBAR BASE */
    .sidebar { width: 260px; background: var(--navy, #163d5c); color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; transition: transform 0.3s ease; overflow-y: auto; }
    .brand { display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 1.5rem; }
    .brand img { width: 40px; height: 40px; background: white; border-radius: 8px; padding: 4px; object-fit: contain; }
    .brand strong { display: block; font-size: 1.2rem; color: var(--gold, #d4af37); }
    .brand small { color: rgba(255,255,255,0.7); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }

    .side-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }

    /* BASE LINK STYLE */
    .side-nav a, .nav-btn {
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.8rem 1rem; border-radius: 8px;
      color: rgba(255, 255, 255, 0.8); text-decoration: none; font-weight: 500; font-size: 0.9rem;
      transition: all 0.2s; background: none; border: none; cursor: pointer; width: 100%; text-align: left;
    }
    .side-nav a:hover, .nav-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .side-nav a.active { background: var(--purple, #6b21a8); color: white; }

    /* ACCORDION SPECIFIC */
    .nav-item-group { display: flex; flex-direction: column; }
    .nav-btn .chevron { margin-left: auto; transition: transform 0.3s; font-size: 18px; }
    .nav-btn.expanded .chevron { transform: rotate(180deg); }

    /* SUB MENU (Collapsed by default) */
    .sub-menu {
      display: flex; flex-direction: column; gap: 0.2rem;
      max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
      padding-left: 1rem;
    }
    .sub-menu.open { max-height: 300px; }
    .sub-menu a {
      padding: 0.6rem 1rem; font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); border-left: 2px solid transparent;
    }
    .sub-menu a:hover { color: white; background: rgba(255, 255, 255, 0.05); }
    .sub-menu a.active { color: white; border-left-color: var(--gold); background: none; }

    /* FOOTER */
    .side-foot { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 1rem; }
    .user-profile { display: flex; align-items: center; gap: 0.8rem; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .user-details strong { display: block; font-size: 0.85rem; color: white; }
    .user-details small { color: rgba(255,255,255,0.6); font-size: 0.75rem; }
    .btn-logout { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.6rem; background: rgba(255, 0, 0, 0.1); border: none; border-radius: 8px; color: #ff9999; cursor: pointer; font-weight: 600; }
    .btn-logout:hover { background: rgba(255, 0, 0, 0.2); }

    /* MAIN CONTENT */
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar { height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; border-bottom: 1px solid #e2e8f0; }
    .site-link { color: var(--navy); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
    .content { padding: 2rem; overflow-y: auto; flex: 1; }
    .menu-btn { display: none; background: none; border: none; cursor: pointer; }
    .scrim { display: none; }

    @media (max-width: 900px) {
      .sidebar { position: fixed; height: 100%; z-index: 50; transform: translateX(-100%); }
      .nav-open .sidebar { transform: translateX(0); }
      .nav-open .scrim { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
      .menu-btn { display: block; }
    }
  `]
})
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  menuOpen = signal(false);
  readonly roleTitle = computed(() => this.auth.role() || 'Staff');

  // State to track which accordion groups are open
  expandedGroups = signal<string[]>([]);

  toggleGroup(group: string) {
    this.expandedGroups.update(current =>
      current.includes(group)
        ? current.filter(g => g !== group) // Close it
        : [...current, group]              // Open it
    );
  }
}