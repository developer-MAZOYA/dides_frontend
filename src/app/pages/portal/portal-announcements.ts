import { Component } from '@angular/core';
import { ANNOUNCEMENTS } from '../../data/announcements';

@Component({
  selector: 'app-portal-announcements',
  template: `
    <div class="page-head">
      <span class="section-tag">Announcements</span>
      <h1>Admission announcements</h1>
      <p>Official notices about intakes, the application process, and the Help Desk.</p>
    </div>

    <div class="list">
      @for (a of announcements; track a.title) {
        <article class="p-card ann">
          <div class="date">{{ a.date }}</div>
          <div>
            <h2>{{ a.title }}</h2>
            <p>{{ a.body }}</p>
            @if (a.link) {
              <a [href]="a.link" target="_blank" rel="noopener">Read the full notice →</a>
            }
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    .list { display: grid; gap: 1rem; }

    .ann {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 1.2rem;
    }

    .date {
      color: var(--deep);
      font-weight: 700;
      font-size: 0.9rem;
    }

    h2 { font-size: 1.1rem; margin: 0 0 0.4rem; }
    p { color: var(--muted); margin: 0 0 0.6rem; }

    a {
      color: var(--purple);
      font-weight: 700;
      text-decoration: none;
    }

    @media (max-width: 600px) {
      .ann { grid-template-columns: 1fr; }
    }
  `],
})
export class PortalAnnouncementsComponent {
  announcements = ANNOUNCEMENTS;
}