import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionSummary } from '../../models/admission.models';

@Component({
  selector: 'app-student-dashboard',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="dash">
      <header class="dash-head">
        <div>
          <span class="section-tag">Student dashboard</span>
          <h1>Welcome, {{ displayName() }}</h1>
          <p class="dash-sub">Track your application and continue where you stopped.</p>
        </div>
        <div class="dash-actions">
          <a routerLink="/portal" class="btn btn-outline">Admissions portal</a>
          <button class="btn btn-outline" type="button" (click)="auth.logout()">Sign out</button>
        </div>
      </header>

      <div class="dash-grid">
        <section class="dash-card">
          <h2>My application</h2>

          <div class="dash-row">
            <input
              class="dash-input"
              type="email"
              [(ngModel)]="email"
              placeholder="Email used to apply"
              autocomplete="email"
            />
            <button class="btn btn-primary" type="button" [disabled]="loading()" (click)="check()">
              {{ loading() ? 'Checking…' : 'Check status' }}
            </button>
          </div>

          @if (error()) {
            <p class="dash-alert">{{ error() }}</p>
          }

          @if (application(); as app) {
            <p class="dash-label">Application number</p>
            <h3 class="dash-number">{{ app.applicationNumber ?? '—' }}</h3>
            <span class="dash-role">{{ submitted() ? 'Submitted' : 'Draft' }}</span>

            <div class="dash-bar" style="margin-top: 1rem">
              <span [style.width.%]="percent()"></span>
            </div>
            <p class="dash-muted">{{ percent() }}% complete</p>

            <ul class="dash-steps">
              @for (s of steps(); track s.label) {
                <li [class.done]="s.done">
                  <span>{{ s.done ? '✓' : '○' }}</span>
                  {{ s.label }}
                </li>
              }
            </ul>

            @if (!submitted()) {
              <a
                class="btn btn-gold"
                routerLink="/portal/apply"
                [queryParams]="{ email: normalisedEmail() }"
              >
                Continue application →
              </a>
            } @else {
              <p class="dash-muted">Your application has been submitted. Use the confirmation code sent to your phone to confirm your admission.</p>
            }
          } @else if (!loading()) {
            <p class="dash-muted">
              No application found yet. <a routerLink="/portal/apply">Start one now</a>.
            </p>
          }
        </section>

        <section class="dash-card">
          <h2>Quick links</h2>
          <nav class="dash-links">
            <a routerLink="/portal/apply">Apply now</a>
            <a routerLink="/portal/status">Check application status</a>
            <a routerLink="/portal/announcements">Announcements</a>
            <a routerLink="/portal/forms">Forms &amp; requirements</a>
            <a routerLink="/contact">Contact the help desk</a>
          </nav>

          <div class="dash-help">
            <h3>Need help?</h3>
            <p>Admission: <a href="tel:+255685506450">0685 506 450</a> / <a href="tel:+255679550047">0679 550 047</a></p>
            <p>Email: <a href="mailto:info@dides.ac.tz">info@dides.ac.tz</a></p>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .dash-help {
      margin-top: 1.4rem;
      padding-top: 1rem;
      border-top: 1px solid #e3eef6;

      h3 { margin: 0 0 0.4rem; font-size: 1rem; }
      p { margin: 0.3rem 0; color: var(--text); font-size: 0.95rem; }
      a { color: var(--navy); font-weight: 600; text-decoration: none; }
    }
  `],
})
export class StudentDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private admissions = inject(AdmissionService);

  email = '';
  loading = signal(false);
  error = signal<string | null>(null);
  application = signal<AdmissionSummary | null>(null);

  readonly displayName = computed(() => {
    const name = this.auth.username();
    return name.includes('@') ? name.split('@')[0] : name;
  });

  readonly normalisedEmail = computed(() => this.email.trim().toLowerCase());

  readonly submitted = computed(() => {
    const a = this.application();
    if (!a) return false;
    return !!a.submittedAt || String(a.status ?? '').toUpperCase().includes('SUBMIT');
  });

  readonly steps = computed(() => {
    const a = this.application();
    if (!a) return [];
    const p = a.personalInfo;
    return [
      { label: 'Start', done: true },
      { label: 'Personal information', done: !!(p?.sex && p?.dateOfBirth && p?.homeAddress) },
      { label: 'Next of kin', done: !!a.nextOfKin },
      { label: 'Education', done: !!a.educationBackgrounds?.length },
    //  { label: 'Sponsor (optional)', done: !!a.sponsor || a.hasSponsor === false },
      { label: 'Courses', done: !!a.selectedCourses?.length },
    ];
  });

  readonly percent = computed(() => {
    // Sponsor is optional, so it is left out of the percentage
    const required = this.steps().filter(s => !s.label.includes('optional'));
    if (required.length === 0) return 0;
    const done = required.filter(s => s.done).length;
    return Math.round((done / required.length) * 100);
  });

  ngOnInit() {
    // The username is the applicant's email, so look up their application straight away
    const name = this.auth.username();
    if (name.includes('@')) {
      this.email = name;
      this.check();
    }
  }

  check() {
    const email = this.normalisedEmail();
    if (!email) {
      this.error.set('Enter the email you used to apply.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.application.set(null);

    this.admissions.findByEmail(email).subscribe({
      next: res => {
        this.loading.set(false);
        if (!res) {
          this.error.set('No application was found for that email.');
          return;
        }
        this.application.set(res);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 404
            ? 'No application was found for that email.'
            : 'Could not check the application right now. Make sure the backend is running.',
        );
      },
    });
  }
}