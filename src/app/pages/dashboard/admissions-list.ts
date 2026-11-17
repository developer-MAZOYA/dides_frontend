import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdmissionService } from '../../services/admission.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

interface AdmissionRow {
  id: string;
  appNo: string;
  name: string;
  email: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CONFIRMED';
  submittedAt: string | null;
  decisionReason: string | null;
}

@Component({
  selector: 'app-admissions-list',
  imports: [DatePipe, FormsModule, NgClass, MatIconModule],
  template: `
    <div class="dashboard-header">
      <div>
        <h1>Admissions</h1>
        <p class="text-muted">Manage student applications and decisions.</p>
      </div>
      <button class="btn-primary" (click)="load()" [disabled]="loading()">Refresh</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon purple"><mat-icon>groups</mat-icon></div>
        <div class="kpi-data"><span class="kpi-value">{{ total() }}</span><span class="kpi-label">Total</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon gold"><mat-icon>pending_actions</mat-icon></div>
        <div class="kpi-data"><span class="kpi-value">{{ count('SUBMITTED') }}</span><span class="kpi-label">Awaiting</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green"><mat-icon>check_circle</mat-icon></div>
        <div class="kpi-data"><span class="kpi-value">{{ count('APPROVED') }}</span><span class="kpi-label">Approved</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red"><mat-icon>cancel</mat-icon></div>
        <div class="kpi-data"><span class="kpi-value">{{ count('REJECTED') }}</span><span class="kpi-label">Rejected</span></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>All Applications</h2>
        <input class="search-input" type="search" placeholder="Search..." (input)="query.set($any($event.target).value)" />
      </div>

      @if (error()) { <div class="alert">{{ error() }}</div> }

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>App No.</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (r of filtered(); track r.id) {
              <tr [class.active-row]="selected()?.id === r.id" (click)="select(r)">
                <td>
                  <div class="applicant-cell">
                    <div class="avatar-small">{{ r.name.charAt(0) }}</div>
                    <div><strong>{{ r.name }}</strong><small>{{ r.email }}</small></div>
                  </div>
                </td>
                <td>{{ r.appNo }}</td>
                <td><span class="status-pill" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span></td>
                <td>{{ r.submittedAt | date:'mediumDate' }}</td>
                <td>
                  @if (r.status === 'SUBMITTED' && canApprove()) {
                    <span class="action-hint">Click to review</span>
                  } @else {
                    <span class="action-hint">View Details</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- DECISION PANEL (Only shows when a row is selected) -->
    @if (selected(); as r) {
      <div class="panel decision-panel">
        <div class="panel-header">
          <h2>Review Application: {{ r.appNo }}</h2>
          <button class="btn-close" (click)="selected.set(null)">✕</button>
        </div>
        <div class="decision-content">
          <p><strong>Applicant:</strong> {{ r.name }} ({{ r.email }})</p>
          
          @if (r.status === 'SUBMITTED' && canApprove()) {
            <div class="decision-box">
              <label>Decision Reason (Required for Reject)</label>
              <textarea class="input-full" [(ngModel)]="decisionReason" rows="3" placeholder="Enter reason..."></textarea>
              <div class="decision-actions">
                <button class="btn-approve" [disabled]="saving()" (click)="approve(r)">Approve Admission</button>
                <button class="btn-reject" [disabled]="saving()" (click)="reject(r)">Reject Admission</button>
              </div>
            </div>
          } @else if (r.status !== 'SUBMITTED') {
            <div class="alert-info">
              This application is already <strong>{{ r.status }}</strong>.
              @if (r.decisionReason) { <br>Reason: {{ r.decisionReason }} }
            </div>
          } @else {
            <div class="alert-info">
              You do not have permission to approve/reject this application.
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { color: var(--navy); font-size: 1.8rem; margin: 0; }
    .text-muted { color: var(--muted); font-size: 0.9rem; margin: 0.2rem 0 0; }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .kpi-card { background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1.2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon.purple { background: rgba(107, 33, 168, 0.1); color: var(--purple); }
    .kpi-icon.gold { background: rgba(212, 175, 55, 0.1); color: var(--gold); }
    .kpi-icon.green { background: rgba(22, 101, 52, 0.1); color: #166534; }
    .kpi-icon.red { background: rgba(155, 28, 28, 0.1); color: #9b1c1c; }
    .kpi-data { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.6rem; font-weight: 700; color: var(--navy); line-height: 1; }
    .kpi-label { font-size: 0.8rem; color: var(--muted); font-weight: 500; margin-top: 0.3rem; text-transform: uppercase; }

    /* Panel & Table */
    .panel { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 1.5rem; }
    .panel-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .panel-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    .search-input { padding: 0.6rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; width: 250px; outline: none; }

    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--muted); background: var(--pale); }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: var(--navy); }
    tr { cursor: pointer; transition: background 0.2s; }
    tr:hover { background: #f8fafc; }
    .active-row { background: #f0fdf4 !important; }

    .applicant-cell { display: flex; align-items: center; gap: 1rem; }
    .avatar-small { width: 36px; height: 36px; border-radius: 50%; background: var(--purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .applicant-cell strong { display: block; }
    .applicant-cell small { color: var(--muted); font-size: 0.8rem; }

    /* Status Pills */
    .status-pill { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status-pill.draft { background: #e2e8f0; color: #475569; }
    .status-pill.submitted { background: #e0e7ff; color: #3730a3; }
    .status-pill.approved { background: #dcfce7; color: #166534; }
    .status-pill.rejected { background: #fee2e2; color: #991b1b; }
    .status-pill.confirmed { background: var(--gold); color: var(--navy); }

    /* Decision Panel */
    .decision-panel { border: 2px solid var(--purple); }
    .btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--muted); }
    .decision-content { padding: 1.5rem; }
    .decision-box { margin-top: 1rem; background: var(--pale); padding: 1.5rem; border-radius: 8px; }
    .input-full { width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; margin: 0.5rem 0 1rem; font-family: inherit; box-sizing: border-box; }
    
    .decision-actions { display: flex; gap: 1rem; }
    .btn-approve { background: #166534; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-reject { background: #991b1b; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-approve:hover { background: #14532d; } .btn-reject:hover { background: #7f1d1d; }

    .alert { background: #fee2e2; color: #991b1b; padding: 1rem; margin: 1rem 1.5rem; border-radius: 6px; }
    .alert-info { background: #e0f2fe; color: #0369a1; padding: 1rem; border-radius: 6px; }
    .btn-primary { background: var(--purple); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdmissionsListComponent implements OnInit {
  private api = inject(AdmissionService);
  readonly auth = inject(AuthService);

  // User Operations Permission Check
  readonly canApprove = computed(() => this.auth.can('ADMISSION_APPROVE'));

  rows = signal<AdmissionRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  
  selected = signal<AdmissionRow | null>(null);
  saving = signal(false);
  decisionReason = '';

  total = computed(() => this.rows().length);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.rows().filter(r => 
      !q || [r.appNo, r.name, r.email].some(v => (v ?? '').toLowerCase().includes(q))
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.listAll().subscribe({
      next: (res) => {
        this.rows.set(res.map((a: any) => {
          let status = String(a.status ?? 'DRAFT').toUpperCase() as AdmissionRow['status'];
          if (a.submittedAt && status === 'DRAFT') status = 'SUBMITTED';
          
          return {
            id: String(a.admissionId),
            appNo: a.applicationNumber ?? '—',
            name: [a.personalInfo?.firstname, a.personalInfo?.lastname].filter(Boolean).join(' ') || 'Unknown',
            email: a.personalInfo?.email ?? '—',
            status: status,
            submittedAt: a.submittedAt,
            decisionReason: a.decisionReason
          };
        }));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load admissions.');
        this.loading.set(false);
      }
    });
  }

  select(r: AdmissionRow) {
    this.selected.set(r);
    this.decisionReason = r.decisionReason ?? '';
    this.error.set(null);
  }

  count(status: string): number {
    return this.rows().filter(r => r.status === status).length;
  }

  approve(r: AdmissionRow) {
    if (!confirm('Are you sure you want to approve this application?')) return;
    this.saving.set(true);
    this.api.approve(Number(r.id), this.decisionReason).subscribe({
      next: () => {
        this.saving.set(false);
        this.selected.set(null);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.error?.message || 'Approval failed.');
      }
    });
  }

  reject(r: AdmissionRow) {
    if (!this.decisionReason.trim()) {
      this.error.set('You must provide a reason to reject.');
      return;
    }
    if (!confirm('Are you sure you want to reject this application?')) return;
    
    this.saving.set(true);
    this.api.reject(Number(r.id), this.decisionReason).subscribe({
      next: () => {
        this.saving.set(false);
        this.selected.set(null);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.error?.message || 'Rejection failed.');
      }
    });
  }
}