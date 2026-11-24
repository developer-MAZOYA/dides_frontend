import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../services/academic.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-enter-grades',
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="dash-container">
      <header class="page-header">
        <h1>Academic Grading</h1>
        <p class="text-muted">Record assessment scores and calculate final semester grades.</p>
      </header>

      <div class="grid-layout">
        <!-- =========================
             LEFT: Enter Assessment Scores
             ========================= -->
        <div class="card">
          <div class="card-header">
            <h2>Enter Assessment Score</h2>
          </div>
          <div class="card-body">
            <p class="text-muted mb-2">Record a raw score for a specific assessment.</p>
            
            <div class="form-field">
              <label>Student Profile ID</label>
              <input class="input-field" type="number" placeholder="e.g. 1" [(ngModel)]="scoreForm.studentId" />
            </div>
            <div class="form-field">
              <label>Assessment ID</label>
              <input class="input-field" type="number" placeholder="e.g. 5" [(ngModel)]="scoreForm.assessmentId" />
            </div>
            <div class="form-field">
              <label>Score Obtained</label>
              <input class="input-field" type="number" placeholder="e.g. 85" [(ngModel)]="scoreForm.score" />
            </div>
            
            <button class="btn-primary mt-4 w-full" [disabled]="savingScore()" (click)="submitScore()">
              <mat-icon>{{ savingScore() ? 'hourglass_empty' : 'save' }}</mat-icon>
              {{ savingScore() ? 'Saving...' : 'Save Score' }}
            </button>
            
            @if (scoreMessage()) {
              <p class="feedback" [class.success]="scoreSuccess()" [class.error]="!scoreSuccess()">
                {{ scoreMessage() }}
              </p>
            }
          </div>
        </div>

        <!-- =========================
             RIGHT: Calculate Final Grade
             ========================= -->
        <div class="card">
          <div class="card-header">
            <h2>Finalize Subject Grade</h2>
          </div>
          <div class="card-body">
            <p class="text-muted mb-2">Calculates weighted average and GPA for the semester.</p>

            <div class="form-field">
              <label>Student Profile ID</label>
              <input class="input-field" type="number" placeholder="e.g. 1" [(ngModel)]="calcForm.studentId" />
            </div>
            <div class="form-field">
              <label>Subject ID</label>
              <input class="input-field" type="number" placeholder="e.g. 2" [(ngModel)]="calcForm.subjectId" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Year</label>
                <input class="input-field" type="number" [(ngModel)]="calcForm.year" />
              </div>
              <div class="form-field">
                <label>Semester</label>
                <select class="input-field" [(ngModel)]="calcForm.semester">
                  <option [value]="1">Semester 1</option>
                  <option [value]="2">Semester 2</option>
                </select>
              </div>
            </div>
            
            <button class="btn-approve mt-4 w-full" [disabled]="calculating()" (click)="calculateGrade()">
              <mat-icon>{{ calculating() ? 'hourglass_empty' : 'calculate' }}</mat-icon>
              {{ calculating() ? 'Calculating...' : 'Calculate Final Grade' }}
            </button>

            @if (calcMessage()) {
              <p class="feedback" [class.success]="calcSuccess()" [class.error]="!calcSuccess()">
                {{ calcMessage() }}
              </p>
            }

            <!-- Result Preview Card -->
            @if (calculatedResult()) {
              <div class="result-card">
                <div class="result-row">
                  <span>Final Score</span>
                  <strong>{{ calculatedResult().finalScore }}%</strong>
                </div>
                <div class="result-row">
                  <span>Grade</span>
                  <span class="grade-badge" [class]="'grade-' + calculatedResult().grade">
                    {{ calculatedResult().grade }}
                  </span>
                </div>
                <div class="result-row">
                  <span>Grade Point</span>
                  <strong>{{ calculatedResult().gradePoint }} / 5.0</strong>
                </div>
                <div class="result-row">
                  <span>Credits</span>
                  <strong>{{ calculatedResult().credits }}</strong>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { color: var(--navy); margin: 0 0 0.2rem 0; font-size: 1.6rem; }
    .text-muted { color: var(--muted); font-size: 0.9rem; margin: 0; }
    
    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 800px) { .grid-layout { grid-template-columns: 1fr; } }
    
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    .card-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    .card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-field { flex: 1; }
    .form-field label { font-size: 0.8rem; font-weight: 600; color: var(--navy); text-transform: uppercase; letter-spacing: 0.5px; }
    .input-field { padding: 0.7rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: var(--navy); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
    .input-field:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(107, 33, 168, 0.1); }
    
    .btn-primary { background: var(--purple); color: white; border: none; padding: 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.95rem; }
    .btn-primary:hover:not(:disabled) { background: #581c87; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-approve { background: #166534; color: white; border: none; padding: 0.8rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.95rem; }
    .btn-approve:hover:not(:disabled) { background: #14532d; }
    .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Feedback Messages */
    .feedback { font-size: 0.9rem; font-weight: 500; text-align: center; padding: 0.6rem; border-radius: 6px; margin: 0; }
    .feedback.success { color: #166534; background: #dcfce7; }
    .feedback.error { color: #991b1b; background: #fee2e2; }

    /* Result Preview Card */
    .result-card {
      margin-top: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem;
    }
    .result-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.5rem 0; border-bottom: 1px solid #dcfce7;
    }
    .result-row:last-child { border-bottom: none; }
    .result-row span { color: #475569; font-size: 0.85rem; }
    .result-row strong { color: var(--navy); font-size: 1rem; }

    /* Grade badges */
    .grade-badge { display: inline-block; font-weight: 700; padding: 0.2rem 0.7rem; border-radius: 4px; font-size: 0.85rem; }
    .grade-A { background: #dcfce7; color: #166534; }
    .grade-B { background: #dbeafe; color: #1e40af; }
    .grade-C { background: #fef9c3; color: #854d0e; }
    .grade-D { background: #ffedd5; color: #9a3412; }
    .grade-F { background: #fee2e2; color: #991b1b; }

    .w-full { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
  `]
})
export class EnterGradesComponent {
  private academicApi = inject(AcademicService);

  // Score form state
  scoreForm = { studentId: 0, assessmentId: 0, score: 0 };
  savingScore = signal(false);
  scoreMessage = signal<string | null>(null);
  scoreSuccess = signal(false);

  // Calculate form state
  calcForm = { studentId: 0, subjectId: 0, year: new Date().getFullYear(), semester: 1 };
  calculating = signal(false);
  calcMessage = signal<string | null>(null);
  calcSuccess = signal(false);
  calculatedResult = signal<any>(null);

  submitScore() {
    if (!this.scoreForm.studentId || !this.scoreForm.assessmentId) {
      this.scoreMessage.set('Please fill in all fields.');
      this.scoreSuccess.set(false);
      return;
    }

    this.savingScore.set(true);
    this.scoreMessage.set(null);

    const payload = {
      student: { id: this.scoreForm.studentId },
      assessment: { id: this.scoreForm.assessmentId },
      scoreObtained: this.scoreForm.score
    };

    this.academicApi.submitAssessmentResult(payload).subscribe({
      next: () => {
        this.savingScore.set(false);
        this.scoreSuccess.set(true);
        this.scoreMessage.set('✅ Score saved successfully!');
        this.scoreForm.score = 0;
        setTimeout(() => this.scoreMessage.set(null), 4000);
      },
      error: (err) => {
        this.savingScore.set(false);
        this.scoreSuccess.set(false);
        this.scoreMessage.set('❌ Failed to save: ' + (err.error?.message || err.statusText));
      }
    });
  }

  calculateGrade() {
    if (!this.calcForm.studentId || !this.calcForm.subjectId) {
      this.calcMessage.set('Please fill in Student ID and Subject ID.');
      this.calcSuccess.set(false);
      return;
    }

    this.calculating.set(true);
    this.calcMessage.set(null);
    this.calculatedResult.set(null);

    this.academicApi.calculateFinalGrade(
      this.calcForm.subjectId,
      this.calcForm.studentId,
      this.calcForm.year,
      this.calcForm.semester
    ).subscribe({
      next: (res) => {
        this.calculating.set(false);
        this.calcSuccess.set(true);
        this.calcMessage.set('✅ Final grade calculated successfully!');
        this.calculatedResult.set(res);
      },
      error: (err) => {
        this.calculating.set(false);
        this.calcSuccess.set(false);
        this.calcMessage.set('❌ Error: ' + (err.error?.message || 'Could not calculate grade'));
      }
    });
  }
}