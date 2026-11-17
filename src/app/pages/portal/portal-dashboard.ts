import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ANNOUNCEMENTS } from '../../data/announcements';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-portal-dashboard',
  imports: [RouterLink,
    MatIconModule
  ],
  template: `
    <div class="page-head">
      <span class="section-tag">Welcome</span>
      <h1>Admissions Portal</h1>
      <p>Apply for Certificate and Diploma programmes at DIDES, check your application, and read the latest announcements.</p>
    </div>

<div class="p-grid">

  <a class="p-card action" routerLink="/portal/apply">
    <span class="ico">
      <mat-icon>edit_document</mat-icon>
    </span>
    <h3>Start an application</h3>
    <p>Complete the seven steps, from personal details to course selection.</p>
    <span class="go">Open application <mat-icon>arrow_forward</mat-icon></span>
  </a>

  <a class="p-card action" routerLink="/portal/status">
    <span class="ico">
      <mat-icon>manage_search</mat-icon>
    </span>
    <h3>Check my application</h3>
    <p>Enter your email to see your application number and where you stopped.</p>
    <span class="go">Check status <mat-icon>arrow_forward</mat-icon></span>
  </a>

  <a class="p-card action" routerLink="/portal/forms">
    <span class="ico">
      <mat-icon>description</mat-icon>
    </span>
    <h3>Forms & requirements</h3>
    <p>See what each step asks for before you start.</p>
    <span class="go">View requirements <mat-icon>arrow_forward</mat-icon></span>
  </a>

</div>


    <div class="split">
      <section class="p-card">
        <h2>Latest announcements</h2>
        @for (a of latest; track a.title) {
          <article class="ann">
            <time>{{ a.date }}</time>
            <h3>{{ a.title }}</h3>
          </article>
        }
        <a routerLink="/portal/announcements" class="more">All announcements →</a>
      </section>

      <section class="p-card help">
        <h2>Need help?</h2>
        <p>Contact the Help Desk for any problem during the application.</p>
        <p><strong>Admission:</strong>
          <a href="tel:+255685506450">0685 506 450</a> /
          <a href="tel:+255679550047">0679 550 047</a>
        </p>
        <p><strong>Email:</strong> <a href="mailto:info@dides.ac.tz">info@dides.ac.tz</a></p>
      </section>
    </div>
  `,
  styles: [`
    .ico { font-size: 1.8rem; }

    .action {
      text-decoration: none;
      color: var(--text);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

      h3 { color: var(--navy); margin: 0.6rem 0 0.3rem; font-size: 1.1rem; }
      p { color: var(--muted); margin: 0 0 1rem; font-size: 0.95rem; }
      .go { margin-top: auto; color: var(--purple); font-weight: 700; }
    }

    .split {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.25rem;
      margin-top: 1.25rem;
    }

    .ann {
      padding: 0.8rem 0;
      border-bottom: 1px solid #e3eef6;

      time { color: var(--deep); font-size: 0.8rem; font-weight: 700; }
      h3 { margin: 0.2rem 0 0; font-size: 1rem; }
    }

    .more {
      display: inline-block;
      margin-top: 0.8rem;
      color: var(--purple);
      font-weight: 700;
      text-decoration: none;
    }

    .help {
      p { color: var(--text); margin: 0.4rem 0; }
      a { color: var(--navy); font-weight: 600; }
    }

    @media (max-width: 800px) {
      .split { grid-template-columns: 1fr; }
    }
  `],
})
export class PortalDashboardComponent {
  latest = ANNOUNCEMENTS.slice(0, 2);
}