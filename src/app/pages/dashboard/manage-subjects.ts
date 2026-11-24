import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../services/academic.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-subjects',
  imports: [FormsModule, MatIconModule, CommonModule],
  template: `
    <div class="dash-container">
      <header class="page-header">
        <div>
          <h1>Manage Subjects</h1>
          <p class="text-muted">Add and organize subjects within specific courses.</p>
        </div>
      </header>

      <div class="card">
        <div class="card-header">
          <h2>Course Curriculum</h2>
          <div class="header-actions">
            <select class="input-field" (change)="onCourseSelect($event)">
              <option value="">Select a Course...</option>
              <option value="1">Diploma in Information Technology</option>
              <option value="2">Certificate in Business Administration</option>
            </select>
          </div>
        </div>

        @if (selectedCourseId() > 0) {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Credits</th><th>Year</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (sub of subjects(); track sub.id) {
                  <tr>
                    <td><span class="badge-code">{{ sub.code }}</span></td>
                    <td><strong>{{ sub.name }}</strong></td>
                    <td>{{ sub.credits }} Credits</td>
                    <td>Year {{ sub.yearOfStudy }}</td>
                    <td>
                      <button class="btn-icon-danger" (click)="deleteSubject(sub.id)" title="Delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="empty-state">No subjects added to this course yet.</td></tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state-box">
            <mat-icon>school</mat-icon>
            <p>Select a course above to view and manage its subjects.</p>
          </div>
        }
      </div>

      <!-- ADD NEW SUBJECT FORM -->
      @if (selectedCourseId() > 0) {
        <div class="card mt-4">
          <div class="card-header">
            <h2>Add New Subject</h2>
          </div>
          <div class="card-body form-grid">
            <div class="form-field">
              <label>Subject Name</label>
              <input class="input-field" placeholder="e.g., Introduction to Programming" [(ngModel)]="newSubject.name" />
            </div>
            <div class="form-field">
              <label>Subject Code</label>
              <input class="input-field" placeholder="e.g., CS101" [(ngModel)]="newSubject.code" />
            </div>
            <div class="form-field">
              <label>Credits</label>
              <input class="input-field" type="number" [(ngModel)]="newSubject.credits" />
            </div>
            <div class="form-field">
              <label>Year of Study</label>
              <select class="input-field" [(ngModel)]="newSubject.yearOfStudy">
                <option [value]="1">Year 1</option>
                <option [value]="2">Year 2</option>
                <option [value]="3">Year 3</option>
              </select>
            </div>
            <div class="form-field">
              <label>Semester</label>
              <select class="input-field" [(ngModel)]="newSubject.semester">
                <option [value]="1">Semester 1</option>
                <option [value]="2">Semester 2</option>
              </select>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-primary" (click)="addSubject()">
              <mat-icon>add</mat-icon> Add Subject to Course
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { color: var(--navy); margin: 0 0 0.2rem 0; font-size: 1.6rem; }
    .text-muted { color: var(--muted); font-size: 0.9rem; margin: 0; }
    
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .card-header { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    .card-header h2 { margin: 0; font-size: 1.1rem; color: var(--navy); }
    .card-body { padding: 1.5rem; }
    .card-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; }
    
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 1rem 1.5rem; background: white; font-size: 0.75rem; color: var(--muted); font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: var(--navy); font-size: 0.9rem; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    
    .badge-code { background: var(--pale); color: var(--navy); font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; }
    
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-field label { font-size: 0.8rem; font-weight: 600; color: var(--navy); text-transform: uppercase; letter-spacing: 0.5px; }
    .input-field { padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; color: var(--navy); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
    .input-field:focus { border-color: var(--purple); }
    
    .btn-primary { background: var(--purple); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
    .btn-primary:hover { background: #581c87; }
    
    .btn-icon-danger { background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.4rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .btn-icon-danger:hover { background: #fee2e2; }
    
    .empty-state-box { padding: 4rem 2rem; text-align: center; color: var(--muted); }
    .empty-state-box mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.4; }
    .empty-state { text-align: center; color: var(--muted); padding: 2rem !important; font-style: italic; }
    .mt-4 { margin-top: 1.5rem; }
  `]
})
export class ManageSubjectsComponent {
  private academicApi = inject(AcademicService);
  
  subjects = signal<any[]>([]);
  selectedCourseId = signal<number>(0);
  newSubject = { name: '', code: '', credits: 3, yearOfStudy: 1, semester: 1 };

  onCourseSelect(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.selectedCourseId.set(id);
    if (id) this.loadSubjects(id);
  }

  loadSubjects(courseId: number) {
    this.academicApi.getSubjectsByCourse(courseId).subscribe(res => this.subjects.set(res));
  }

  addSubject() {
    if (!this.newSubject.name || !this.newSubject.code) return;
    const payload = { ...this.newSubject, course: { courseId: this.selectedCourseId() } };
    this.academicApi.createSubject(payload).subscribe(() => {
      this.loadSubjects(this.selectedCourseId());
      this.newSubject = { name: '', code: '', credits: 3, yearOfStudy: 1, semester: 1 };
    });
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.academicApi.deleteSubject(id).subscribe(() => this.loadSubjects(this.selectedCourseId()));
    }
  }
}