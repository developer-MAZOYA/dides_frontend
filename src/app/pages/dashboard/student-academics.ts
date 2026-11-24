import { Component, OnInit, inject, signal } from '@angular/core';
import { AcademicService } from '../../services/academic.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-academics',
  imports: [MatIconModule],
  template: `
    <div class="dash-container">
      <header class="page-header">
        <h1>My Academic Record</h1>
        <p class="text-muted">View your current subjects and final grades.</p>
      </header>

      <!-- GPA HIGHLIGHT -->
      @if (gpa()) {
        <div class="gpa-banner">
          <div class="gpa-icon"><mat-icon>workspace_premium</mat-icon></div>
          <div class="gpa-info">
            <span>Cumulative Grade Point Average</span>
            <strong>{{ gpa()?.cumulativeGpa || '0.00' }}</strong>
          </div>
          <div class="gpa-semester">
            Semester GPA: <strong>{{ gpa()?.semesterGpa || '0.00' }}</strong>
          </div>
        </div>
      }

      <div class="grid-layout">
        <!-- SUBJECTS TABLE -->
        <div class="card">
          <div class="card-header">
            <h2>Registered Subjects</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Credits</th></tr>
              </thead>
              <tbody>
                @for (s of subjects(); track s.id) {
                  <tr>
                    <td><span class="badge-code">{{ s.code }}</span></td>
                    <td>{{ s.name }}</td>
                    <td>{{ s.credits }} Credits</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="empty-state">No subjects registered.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- RESULTS TABLE -->
        <div class="card">
          <div class="card-header">
            <h2>Final Grades</h2>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Subject</th><th>Score</th><th>Grade</th><th>GPA</th></tr>
              </thead>
              <tbody>
                @for (r of results(); track r.id) {
                  <tr>
                    <td><strong>{{ r.subject?.name }}</strong></td>
                    <td>{{ r.finalScore }}%</td>
                    <td>
                      <span class="grade-badge" [class]="'grade-' + (r.grade || 'F')">
                        {{ r.grade || '—' }}
                      </span>
                    </td>
                    <td>{{ r.gradePoint ?? '—' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="empty-state">No final results published yet.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { color: var(--navy); margin: 0 0 0.2rem 0; font-size: 1.6rem; }
    .text-muted { color: var(--muted); font-size: 0.9rem; margin: 0; }
    
    /* GPA Banner */
    .gpa-banner { display: flex; align-items: center; gap: 1.5rem; background: var(--navy); color: white; padding: 1.5rem 2rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .gpa-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; }
    .gpa-icon mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--gold); }
    .gpa-info { display: flex; flex-direction: column; flex: 1; }
    .gpa-info span { font-size: 0.85rem; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; }
    .gpa-info strong { font-size: 2.2rem; line-height: 1.1; color: var(--gold); }
    .gpa-semester { font-size: 1rem; color: rgba(255,255,255,0.9); }
    .gpa-semester strong { font-size: 1.4rem; color: white; }
    
    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 900px) { .grid-layout { grid-template-columns: 1fr; } }
    
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    .card-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem 1.5rem; background: white; font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: var(--navy); font-size: 0.9rem; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    
    .badge-code { background: var(--pale); color: var(--navy); font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
    .grade-badge { display: inline-block; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem; }
    .grade-A { background: #dcfce7; color: #166534; }
    .grade-B { background: #dbeafe; color: #1e40af; }
    .grade-C { background: #fef9c3; color: #854d0e; }
    .grade-D { background: #ffedd5; color: #9a3412; }
    .grade-F { background: #fee2e2; color: #991b1b; }
    
    .empty-state { text-align: center; color: var(--muted); padding: 2rem !important; font-style: italic; }
  `]
})
export class StudentAcademicsComponent implements OnInit {
  private academicApi = inject(AcademicService);

  subjects = signal<any[]>([]);
  results = signal<any[]>([]);
  gpa = signal<any>(null);

  ngOnInit() {
    this.academicApi.getMySubjects().subscribe(s => this.subjects.set(s));
    this.academicApi.getMyResults().subscribe(r => this.results.set(r));
    this.academicApi.getMyGpa().subscribe(g => this.gpa.set(g));
  }
}