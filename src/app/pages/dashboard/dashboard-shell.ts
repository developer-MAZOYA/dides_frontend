import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="shell" [class.nav-open]="menuOpen()">
      <aside class="sidebar">
        <a [routerLink]="auth.homePath()" class="brand">
          <img src="dides.png" alt="DIDES logo" />
          <div>
            <strong>DIDES</strong>
            <small>{{ roleTitle() }} portal</small>
          </div>
        </a>

        <nav>
          @for (item of nav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              (click)="menuOpen.set(false)"
            >
              <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="side-foot">
          <small>Signed in as</small>
          <strong class="who">{{ auth.username() }}</strong>
        </div>
      </aside>

      <div class="scrim" (click)="menuOpen.set(false)"></div>

      <div class="main">
        <header class="topbar">
          <button class="menu-btn" type="button" aria-label="Open menu" (click)="menuOpen.set(!menuOpen())">
            <mat-icon aria-hidden="true">menu</mat-icon>
          </button>

          <div class="title">{{ roleTitle() }} <span>dashboard</span></div>

          <div class="top-actions">
            <a routerLink="/" class="site-link">
              <mat-icon aria-hidden="true">language</mat-icon>
              <span>Public website</span>
            </a>
            <button type="button" class="signout" (click)="auth.logout()">
              <mat-icon aria-hidden="true">logout</mat-icon>
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div class="content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .shell {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
      background: var(--pale);
    }

    /* Sidebar */

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      padding: 1.2rem 1rem;
      background: var(--sky);
      border-right: 1px solid var(--mid);
      overflow-y: auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.3rem 0.5rem 1rem;
      border-bottom: 1px solid rgba(22, 61, 92, 0.12);
      text-decoration: none;

      img {
        width: 46px;
        height: 46px;
        object-fit: contain;
        background: #fff;
        border-radius: 10px;
        padding: 4px;
      }

      div {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }

      strong {
        color: var(--purple);
        font-size: 1.05rem;
      }

      small {
        color: var(--muted);
        font-size: 0.78rem;
      }
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        border-left: 4px solid transparent;
        color: var(--navy);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        &.active {
          background: #fff;
          color: var(--purple);
          border-left-color: var(--purple);
          box-shadow: var(--shadow-sm);
        }
      }
    }

    .side-foot {
      margin-top: auto;
      padding: 1rem;
      background: #fff;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      small {
        color: var(--muted);
      }

      .who {
        color: var(--navy);
        word-break: break-all;
      }
    }

    /* Top bar */

    .main {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.5rem;
      background: #fff;
      border-bottom: 4px solid var(--gold);
      box-shadow: var(--shadow-sm);
    }

    .title {
      flex: 1;
      font-weight: 700;
      color: var(--navy);
      font-size: 1.05rem;

      span {
        color: var(--purple);
      }
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .site-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--deep);
      font-weight: 600;
      text-decoration: none;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .signout {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border: 1px solid #f0c4c4;
      border-radius: 8px;
      background: #fff5f5;
      color: #9b1c1c;
      font: inherit;
      font-weight: 600;
      cursor: pointer;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: #fde8e8;
      }
    }

    .menu-btn {
      display: none;
      background: none;
      border: 0;
      color: var(--navy);
      cursor: pointer;
    }

    .content {
      width: 100%;
      max-width: 1200px;
      padding: 1.5rem;
    }

    .scrim {
      display: none;
    }

    /* Phones and tablets */

    @media (max-width: 900px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        height: auto;
        z-index: 40;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }

      .nav-open .sidebar {
        transform: translateX(0);
      }

      .nav-open .scrim {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(22, 61, 92, 0.35);
        z-index: 30;
      }

      .menu-btn {
        display: block;
      }
    }

    @media (max-width: 600px) {
      .site-link span {
        display: none;
      }
    }
  `],
})
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  menuOpen = signal(false);

  readonly roleTitle = computed(() => {
    switch (this.auth.role()) {
      case 'STUDENT':
        return 'Student';
      case 'ADMIN':
        return 'Admin';
      case 'DIRECTOR':
        return 'Director';
      default:
        return 'Staff';
    }
  });

  /** Students see only their account. Admins and directors see users and all admissions. */
  readonly nav = computed<NavItem[]>(() => {
    switch (this.auth.role()) {
      case 'STUDENT':
        return [
          { label: 'My account', path: '/dashboard/student', icon: 'person', exact: true },
        ];
      case 'ADMIN':
        return [
          { label: 'Users', path: '/dashboard/admin', icon: 'group', exact: true },
          { label: 'All admissions', path: '/dashboard/admissions', icon: 'fact_check' },
        ];
      case 'DIRECTOR':
        return [
          { label: 'Users', path: '/dashboard/director', icon: 'group', exact: true },
          { label: 'All admissions', path: '/dashboard/admissions', icon: 'fact_check' },
        ];
      default:
        return [];
    }
  });
}