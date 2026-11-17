import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionSummary } from '../../models/admission.models';

type StatusFilter = 'ALL' | 'DRAFT' | 'SUBMITTED';

interface AdmissionRow {
  id: string;
  appNo: string;
  name: string;
  email: string;
  step: string;
  status: 'DRAFT' | 'SUBMITTED';
  submittedAt: string | null;
  courses: string[];
  hasSponsor: boolean;
  personal: AdmissionSummary['personalInfo'];
}

@Component({
  selector: 'app-admissions-list',
  imports: [DatePipe],
  template: `
    <section class="adm">
      <header class="dash-head">
        <div>
          <span class="section-tag">Admissions</span>
          <h1>All applications</h1>
          <p class="dash-sub">Every application in the system, newest first.</p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-outline" type="button" [disabled]="loading()" (click)="load()">Refresh</button>
        </div>
      </header>

      <div class="dash-stats">
        <div class="dash-stat"><span>{{ total() }}</span><small>Total</small></div>
        <div class="dash-stat"><span>{{ submittedCount() }}</span><small>Submitted</small></div>
        <div class="dash-stat"><span>{{ draftCount() }}</span><small>Drafts</small></div>
      </div>

      <div class="toolbar">
        <input
          class="dash-input search"
          type="search"
          placeholder="Search application number, name or email…"
          (input)="query.set(readValue($event))"
        />
        <div class="seg" role="group" aria-label="Filter by status">
          @for (f of filters; track f.value) {
            <button
              type="button"
              [class.on]="statusFilter() === f.value"
              (click)="statusFilter.set(f.value)"
            >
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      @if (error()) {
        <div class="dash-alert">{{ error() }}</div>
      }

      <div class="layout">
        <div class="dash-card table-card">
          @if (loading()) {
            <p class="dash-muted">Loading applications…</p>
          } @else if (filtered().length === 0) {
            <p class="dash-muted">No applications match.</p>
          } @else {
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Applicant</th>
                    <th>Step</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of filtered(); track r.id) {
                    <tr [class.active]="selected()?.id === r.id" (click)="selected.set(r)">
                      <td><strong>{{ r.appNo }}</strong></td>
                      <td>
                        <span class="name">{{ r.name }}</span>
                        <small class="email">{{ r.email }}</small>
                      </td>
                      <td>{{ r.step }}</td>
                      <td>
                        <span class="dash-role" [class.submitted]="r.status === 'SUBMITTED'">
                          {{ r.status === 'SUBMITTED' ? 'Submitted' : 'Draft' }}
                        </span>
                      </td>
                      <td>
                        @if (r.submittedAt) {
                          {{ r.submittedAt | date: 'd MMM yyyy' }}
                        } @else {
                          —
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <aside class="dash-card detail">
          @if (selected(); as r) {
            <h2>{{ r.appNo }}</h2>
            <span class="dash-role" [class.submitted]="r.status === 'SUBMITTED'">
              {{ r.status === 'SUBMITTED' ? 'Submitted' : 'Draft' }}
            </span>

            <dl class="dash-facts">
              <dt>Name</dt>
              <dd>{{ r.name }}</dd>
              <dt>Email</dt>
              <dd>{{ r.email }}</dd>
              <dt>Mobile</dt>
              <dd>{{ r.personal?.mobileNumber || '—' }}</dd>
              <dt>Date of birth</dt>
              <dd>{{ r.personal?.dateOfBirth?.slice(0, 10) || '—' }}</dd>
              <dt>Sex</dt>
              <dd>{{ r.personal?.sex || '—' }}</dd>
              <dt>Citizenship</dt>
              <dd>{{ r.personal?.citizenship || '—' }}</dd>
              <dt>Address</dt>
              <dd>{{ r.personal?.homeAddress || '—' }}</dd>
              <dt>Sponsor</dt>
              <dd>{{ r.hasSponsor ? 'Yes' : 'None' }}</dd>
              <dt>Courses</dt>
              <dd>{{ r.courses.length ? r.courses.join(', ') : 'None' }}</dd>
            </dl>
          } @else {
            <p class="dash-muted">Select an application to see its details.</p>
          }
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .toolbar {
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 1rem;

      .search {
        flex: 1;
        min-width: 260px;
        margin-bottom: 0;
      }
    }

    .seg {
      display: inline-flex;
      background: #fff;
      border: 1px solid var(--mid);
      border-radius: 999px;
      overflow: hidden;

      button {
        border: 0;
        background: transparent;
        padding: 0.55rem 1rem;
        font: inherit;
        font-weight: 600;
        color: var(--navy);
        cursor: pointer;

        &.on {
          background: var(--purple);
          color: #fff;
        }
      }
    }

    .layout {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 1.25rem;
      align-items: start;
    }

    .table-scroll {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;

      th {
        text-align: left;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted);
        padding: 0.6rem 0.7rem;
        border-bottom: 1px solid #e3eef6;
      }

      td {
        padding: 0.75rem 0.7rem;
        border-bottom: 1px solid #f0f6fa;
        color: var(--text);
        vertical-align: top;
      }

      tbody tr {
        cursor: pointer;
        transition: background 0.15s;

        &:hover {
          background: var(--pale);
        }

        &.active {
          background: #fbf1fd;
        }
      }
    }

    .name {
      display: block;
      color: var(--navy);
      font-weight: 600;
    }

    .email {
      color: var(--muted);
    }

    .dash-role.submitted {
      background: var(--deep);
      color: #fff;
    }

    .detail h2 {
      margin-top: 0;
      color: var(--purple);
      word-break: break-word;
    }

    .detail .dash-role {
      display: inline-block;
      margin-bottom: 1rem;
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AdmissionsListComponent implements OnInit {
  private api = inject(AdmissionService);

  readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'DRAFT', label: 'Drafts' },
    { value: 'SUBMITTED', label: 'Submitted' },
  ];

  rows = signal<AdmissionRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  statusFilter = signal<StatusFilter>('ALL');
  selected = signal<AdmissionRow | null>(null);

  total = computed(() => this.rows().length);
  submittedCount = computed(() => this.rows().filter(r => r.status === 'SUBMITTED').length);
  draftCount = computed(() => this.total() - this.submittedCount());

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();

    return this.rows().filter(r => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (!q) return true;
      return [r.appNo, r.name, r.email].some(v => v.toLowerCase().includes(q));
    });
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.listAll().subscribe({
      next: list => {
        const rows = list.map(a => this.toRow(a)).sort((x, y) => this.compareIdsDesc(x.id, y.id));
        this.rows.set(rows);
        this.loading.set(false);

        // Keep the open detail panel in step with the refreshed data
        const current = this.selected();
        this.selected.set(current ? rows.find(r => r.id === current.id) ?? null : null);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 0
            ? 'Cannot reach the server. Check that the backend is running on port 9090.'
            : `Could not load applications (status ${err.status}).`,
        );
      },
    });
  }

  readValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private toRow(a: AdmissionSummary): AdmissionRow {
    const p = a.personalInfo;
    const submitted = !!a.submittedAt || String(a.status ?? '').toUpperCase().includes('SUBMIT');
    const raw = (a.selectedCourses ?? []) as Array<Record<string, unknown>>;
    const name = [p?.firstname, p?.lastname].filter(Boolean).join(' ');

    return {
      id: String(a.admissionId ?? (a as Record<string, unknown>)['id'] ?? ''),
      appNo: a.applicationNumber ?? '—',
      name: name || '—',
      email: p?.email ?? '—',
      step: a.currentStep ?? a.current_step ?? '—',
      status: submitted ? 'SUBMITTED' : 'DRAFT',
      submittedAt: a.submittedAt ?? null,
      courses: raw
        .map(c => String(c['courseName'] ?? c['course_name'] ?? c['name'] ?? ''))
        .filter(Boolean),
      hasSponsor: !!a.sponsor,
      personal: p ?? null,
    };
  }

  /** Compares numeric strings without losing precision for large IDs. */
  private compareIdsDesc(a: string, b: string): number {
    return b.length - a.length || b.localeCompare(a);
  }
}