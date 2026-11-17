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
        <img src="dides.png" alt="DIDES logo" class="logo" />
          <div>
            <strong>DIDES</strong>
            <small>{{ roleTitle() }} Portal</small>
          </div>
        </div>

        <nav class="side-nav">
          <!-- DYNAMIC HOME LINK -->
          @if (auth.role() === 'STUDENT') {
            <a routerLink="/dashboard/student" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>home</mat-icon> My Dashboard
            </a>
          } @else {
            <a routerLink="/dashboard/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>dashboard</mat-icon> Admin Dashboard
            </a>
          }

          <!-- STUDENT MENUS -->
          @if (auth.role() === 'STUDENT') {
            <div class="nav-group">
              <div class="nav-label"><mat-icon>menu_book</mat-icon> Academics</div>
              <a routerLink="/dashboard/student/courses" routerLinkActive="active">My Courses</a>
              <a routerLink="/dashboard/student/results" routerLinkActive="active">My Results</a>
              <a routerLink="/dashboard/student/registration" routerLinkActive="active">Online Registration</a>
            </div>
            <div class="nav-group">
              <div class="nav-label"><mat-icon>payments</mat-icon> Finance</div>
              <a routerLink="/dashboard/student/fees" routerLinkActive="active">Fee Statement</a>
            </div>
          }

          <!-- ADMIN/STAFF MENUS -->
          @if (auth.can('USER_READ')) {
            <a routerLink="/dashboard/users" routerLinkActive="active">
              <mat-icon>group</mat-icon> User Management
            </a>
          }
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
    /* Same styles as before */
    .shell { display: flex; height: 100vh; background: var(--pale, #f4f7f9); font-family: 'Inter', sans-serif; }
    .sidebar { width: 260px; background: var(--navy, #163d5c); color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; transition: transform 0.3s ease; }
    .brand { display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 1.5rem; }
    .brand img { width: 40px; height: 40px; background: white; border-radius: 8px; padding: 4px; }
    .brand strong { display: block; font-size: 1.2rem; color: var(--gold, #d4af37); }
    .brand small { color: rgba(255,255,255,0.7); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
    .side-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; overflow-y: auto; }
    .side-nav a, .nav-label { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; border-radius: 8px; color: rgba(255, 255, 255, 0.8); text-decoration: none; font-weight: 500; transition: all 0.2s; font-size: 0.9rem; }
    .side-nav a:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .side-nav a.active { background: var(--purple, #6b21a8); color: white; }
    .nav-group { margin-top: 1rem; }
    .nav-label { color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding-bottom: 0.2rem; }
    .nav-group a { padding-left: 2.5rem; font-size: 0.85rem; }
    .side-foot { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 1rem; }
    .user-profile { display: flex; align-items: center; gap: 0.8rem; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .user-details strong { display: block; font-size: 0.85rem; color: white; }
    .user-details small { color: rgba(255,255,255,0.6); font-size: 0.75rem; }
    .btn-logout { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.6rem; background: rgba(255, 0, 0, 0.1); border: none; border-radius: 8px; color: #ff9999; cursor: pointer; font-weight: 600; }
    .btn-logout:hover { background: rgba(255, 0, 0, 0.2); }
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
}