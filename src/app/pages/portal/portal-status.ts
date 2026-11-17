import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionSummary } from '../../models/admission.models';

interface Step {
  label: string;
  done: boolean;
  required: boolean;
}

@Component({
  selector: 'app-portal-status',
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-head">
      <span class="section-tag">Application status</span>
      <h1>Check your application</h1>
      <p>Enter the email you used when you started. We will show your application number and the step you reached.</p>
    </div>

    <section class="p-card">
      <form [formGroup]="form" (ngSubmit)="search()" class="search-row">
        <input type="email" formControlName="email" placeholder="you@example.com" />
        <button class="btn btn-primary" type="submit" [disabled]="loading()">
          {{ loading() ? 'Checking…' : 'Check status' }}
        </button>
      </form>
      @if (error()) {
        <p class="err">{{ error() }}</p>
      }
    </section>

    @if (found(); as res) {
      <section class="p-card result">
        <div class="result-head">
          <div>
            <p class="label">Application number</p>
            <h2>{{ res.applicationNumber ?? '—' }}</h2>
            <p class="muted">
              {{ res.personalInfo?.firstname }} {{ res.personalInfo?.lastname }} · {{ checkedEmail() }}
            </p>
          </div>
          <span class="badge" [class.done]="isSubmitted(res)">
            {{ isSubmitted(res) ? 'Submitted' : 'Draft' }}
          </span>
        </div>

        <div class="bar"><span [style.width.%]="percent()"></span></div>
        <p class="muted small">{{ percent() }}% of required steps completed</p>

        <ul class="steps">
          @for (s of progress(); track s.label) {
            <li [class.done]="s.done">
              <span class="dot">{{ s.done ? '✓' : '○' }}</span>
              <span>{{ s.label }}</span>
              @if (!s.required) {
                <small>optional</small>
              }
            </li>
          }
        </ul>

        @if (!isSubmitted(res)) {
          <button class="btn btn-gold" type="button" (click)="continueApplication()">
            Continue application →
          </button>
        }
      </section>
    }
  `,
  styles: [`
    .search-row {
      display: flex;
      gap: 0.7rem;
      flex-wrap: wrap;

      input {
        flex: 1;
        min-width: 240px;
        font: inherit;
        padding: 0.75rem 0.9rem;
        border: 1px solid #c7dbe8;
        border-radius: 10px;
        background: #fbfeff;
      }
    }

    .err {
      margin: 1rem 0 0;
      color: #9b1c1c;
      font-weight: 600;
    }

    .result { margin-top: 1.5rem; }

    .result-head {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1.2rem;

      h2 { margin: 0.2rem 0; color: var(--purple); }
    }

    .label {
      margin: 0;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--deep);
    }

    .muted { color: var(--muted); margin: 0.2rem 0; }
    .small { font-size: 0.88rem; }

    .badge {
      background: var(--sky);
      color: var(--deep);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;

      &.done { background: var(--deep); color: #fff; }
    }

    .bar {
      height: 10px;
      background: #e3eef6;
      border-radius: 999px;
      overflow: hidden;

      span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, var(--mid), var(--purple));
        border-radius: 999px;
        transition: width 0.4s ease;
      }
    }

    .steps {
      list-style: none;
      padding: 0;
      margin: 1.2rem 0;
      display: grid;
      gap: 0.6rem;

      li {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        color: var(--muted);
        font-weight: 600;

        &.done { color: var(--navy); }
        small { color: var(--muted); font-weight: 400; }
      }

      .dot {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid var(--mid);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: var(--deep);
      }

      li.done .dot { background: var(--deep); border-color: var(--deep); color: #fff; }
    }
  `],
})
export class PortalStatusComponent {
  private fb = inject(FormBuilder).nonNullable;
  private api = inject(AdmissionService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  found = signal<AdmissionSummary | null>(null);
  checkedEmail = signal('');
  progress = signal<Step[]>([]);

  percent = computed(() => {
    const required = this.progress().filter(s => s.required);
    if (required.length === 0) return 0;
    const done = required.filter(s => s.done).length;
    return Math.round((done / required.length) * 100);
  });

  search() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.getRawValue().email.trim().toLowerCase();
    this.loading.set(true);
    this.error.set(null);
    this.found.set(null);

    this.api.findByEmail(email).subscribe({
      next: res => {
        this.loading.set(false);
        if (!res) {
          this.error.set('No application was found for that email.');
          return;
        }
        this.checkedEmail.set(email);
        this.found.set(res);
        this.progress.set(this.buildProgress(res));
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 404
            ? 'No application was found for that email.'
            : 'Could not check the application. Make sure the backend is running.',
        );
      },
    });
  }

  continueApplication() {
    this.router.navigate(['/portal/apply'], {
      queryParams: { email: this.checkedEmail() },
    });
  }

  isSubmitted(res: AdmissionSummary): boolean {
    return !!res.submittedAt || String(res.status ?? '').toUpperCase().includes('SUBMIT');
  }

  private buildProgress(res: AdmissionSummary): Step[] {
    const p = res.personalInfo;
    return [
      { label: 'Start', done: true, required: true },
      {
        label: 'Personal information',
        done: !!(p?.sex && p?.dateOfBirth && p?.homeAddress),
        required: true,
      },
      { label: 'Next of kin', done: !!res.nextOfKin, required: true },
      { label: 'Education', done: !!res.educationBackgrounds?.length, required: true },
      { label: 'Sponsor', done: !!res.sponsor, required: false },
      { label: 'Courses', done: !!res.selectedCourses?.length, required: true },
    ];
  }
}