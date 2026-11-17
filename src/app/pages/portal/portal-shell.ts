
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  template: `
    <div class="shell" [class.nav-open]="menuOpen()">

      <!-- Sidebar -->
      <aside class="sidebar">

        <a routerLink="/" class="brand" (click)="menuOpen.set(false)">
         <img src="/dides.png" alt="DIDES Logo" class="brand-logo" />

          <div>
            <strong>DIDES</strong>
            <small>Admissions Portal</small>
          </div>
        </a>

        <!-- Navigation -->
        <nav aria-label="Main navigation">

          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              (click)="menuOpen.set(false)"
            >
              <mat-icon class="nav-icon">
                {{ item.icon }}
              </mat-icon>

              <span>{{ item.label }}</span>
            </a>
          }

        </nav>

        <!-- Help section -->
        <div class="side-help">

          <div class="help-heading">
            <mat-icon>support_agent</mat-icon>
            <p>Need help?</p>
          </div>

          <a href="tel:+255685506450">
            <mat-icon>phone</mat-icon>
            0685 506 450
          </a>

          <a href="tel:+255679550047">
            <mat-icon>phone</mat-icon>
            0679 550 047
          </a>

          <a href="mailto:info@dides.ac.tz">
            <mat-icon>email</mat-icon>
            info@dides.ac.tz
          </a>

        </div>

      </aside>

      <!-- Mobile overlay -->
      <div
        class="scrim"
        (click)="menuOpen.set(false)"
      ></div>

      <!-- Main content -->
      <div class="main">

        <!-- Topbar -->
        <header class="topbar">

          <button
            class="menu-btn"
            type="button"
            aria-label="Toggle navigation menu"
            [attr.aria-expanded]="menuOpen()"
            (click)="menuOpen.set(!menuOpen())"
          >
            <mat-icon>
              {{ menuOpen() ? 'close' : 'menu' }}
            </mat-icon>
          </button>

          <div class="title">
            Admissions
            <span>2026/2027</span>
          </div>

          <div class="top-actions">

            <a routerLink="/" class="back">
              <mat-icon>arrow_back</mat-icon>
              <span>Back to website</span>
            </a>

            <a
              routerLink="/portal/status"
              class="btn btn-primary small"
            >
              <mat-icon>fact_check</mat-icon>
              Check my application
            </a>

          </div>

        </header>

        <!-- Page content -->
        <main class="content">
          <router-outlet />
        </main>

      </div>

    </div>
  `,

  styles: [`

    :host {
      display: block;
    }

    /* Main layout */

    .shell {
      display: grid;
      grid-template-columns: 325px minmax(0, 1fr);
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
      gap: 1.5rem;
      padding: 1.5rem 1.2rem;
      box-sizing: border-box;
      background: var(--sky);
      border-right: 1px solid var(--mid);
      overflow-y: auto;
    }

    /* Brand */

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.3rem 0.5rem 1.2rem;
      border-bottom: 1px solid rgba(22, 61, 92, 0.12);
      text-decoration: none;

      img {
        width: 54px;
        height: 54px;
        object-fit: contain;
        background: #fff;
        border-radius: 12px;
        padding: 5px;
        flex-shrink: 0;
      }

      div {
        display: flex;
        flex-direction: column;
        line-height: 1.3;
      }

      strong {
        color: var(--purple);
        font-size: 1.2rem;
        font-weight: 800;
        letter-spacing: 0.5px;
      }

      small {
        color: var(--muted);
        font-size: 0.85rem;
      }
    }

    /* Navigation */

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;

      a {
        display: flex;
        align-items: center;
        gap: 1rem;
        min-height: 48px;
        padding: 0.8rem 1rem;
        box-sizing: border-box;
        border-radius: 10px;
        border-left: 4px solid transparent;
        color: var(--navy);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.98rem;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.65);
          transform: translateX(2px);
        }

        &.active {
          background: #fff;
          color: var(--purple);
          border-left-color: var(--purple);
          box-shadow: var(--shadow-sm);
        }

        .nav-icon {
          width: 25px;
          height: 25px;
          font-size: 25px;
          line-height: 25px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    /* Help section */

    .side-help {
      margin-top: auto;
      padding: 1.2rem;
      background: #fff;
      border-radius: 14px;
      font-size: 0.9rem;
      box-shadow: var(--shadow-sm);

      .help-heading {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.8rem;
        color: var(--purple);

        mat-icon {
          font-size: 22px;
        }

        p {
          margin: 0;
          font-weight: 800;
          color: var(--navy);
        }
      }

      a {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        color: var(--deep);
        font-weight: 600;
        text-decoration: none;
        margin: 0.65rem 0;
        overflow-wrap: anywhere;

        mat-icon {
          width: 19px;
          height: 19px;
          font-size: 19px;
          flex-shrink: 0;
          color: var(--purple);
        }

        &:hover {
          color: var(--purple);
        }
      }
    }

    /* Main section */

    .main {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* Topbar */

    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.8rem;
      background: #fff;
      border-bottom: 4px solid var(--gold);
      box-shadow: var(--shadow-sm);
    }

    .title {
      flex: 1;
      font-weight: 800;
      color: var(--navy);
      font-size: 1.1rem;

      span {
        color: var(--purple);
        margin-left: 0.35rem;
      }
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 1.3rem;
    }

    .back {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--deep);
      font-weight: 600;
      text-decoration: none;

      mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
    }

    .btn.small {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      font-size: 0.9rem;
      text-decoration: none;

      mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
    }

    /* Mobile menu button */

    .menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 9px;
      background: var(--sky);
      color: var(--navy);
      cursor: pointer;

      mat-icon {
        font-size: 25px;
        width: 25px;
        height: 25px;
      }
    }

    /* Content */

    .content {
      width: 100%;
      max-width: 1400px;
      box-sizing: border-box;
      padding: 2rem 1.8rem 3rem;
    }

    /* Overlay */

    .scrim {
      display: none;
    }

    /* Tablet and mobile */

    @media (max-width: 900px) {

      .shell {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: min(325px, 85vw);
        height: 100dvh;
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
        background: rgba(22, 61, 92, 0.4);
        z-index: 30;
      }

      .menu-btn {
        display: flex;
      }

      .back {
        display: none;
      }
    }

    @media (max-width: 560px) {

      .topbar {
        padding: 0.8rem 1rem;
        gap: 0.7rem;
      }

      .title {
        font-size: 0.95rem;
      }

      .top-actions .btn {
        display: none;
      }

      .content {
        padding: 1.2rem 1rem 2rem;
      }
    }

  `]
})
export class PortalShellComponent {

  menuOpen = signal(false);

  readonly nav: NavItem[] = [
    {
      label: 'Overview',
      path: '/portal',
      icon: 'dashboard',
      exact: true
    },
    {
      label: 'Apply now',
      path: '/portal/apply',
      icon: 'edit_document'
    },
    {
      label: 'Check status',
      path: '/portal/status',
      icon: 'manage_search'
    },
    {
      label: 'Announcements',
      path: '/portal/announcements',
      icon: 'campaign'
    },
    {
      label: 'Forms & requirements',
      path: '/portal/forms',
      icon: 'description'
    }
  ];

}
