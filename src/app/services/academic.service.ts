import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class AcademicService {
  private http = inject(HttpClient);
  private store = inject(SessionStore);
  private api = 'http://localhost:9090/api';

  private headers() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.store.token()}` });
  }

  // --- ADMIN: SUBJECTS ---
  getSubjectsByCourse(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/subjects/course/${courseId}`, { headers: this.headers() });
  }
  createSubject(data: any): Observable<any> {
    return this.http.post(`${this.api}/subjects`, data, { headers: this.headers() });
  }
  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.api}/subjects/${id}`, { headers: this.headers() });
  }

  // --- ADMIN: ASSESSMENTS ---
  getAssessmentsBySubject(subjectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/assessments/subject/${subjectId}`, { headers: this.headers() });
  }
  createAssessment(data: any): Observable<any> {
    return this.http.post(`${this.api}/assessments`, data, { headers: this.headers() });
  }

  // --- ADMIN: GRADES ---
  submitAssessmentResult(data: any): Observable<any> {
    return this.http.post(`${this.api}/assessment-results`, data, { headers: this.headers() });
  }
  calculateFinalGrade(subjectId: number, studentId: number, year: number, semester: number): Observable<any> {
    return this.http.post(
      `${this.api}/academic/calculate/${subjectId}?studentId=${studentId}&year=${year}&semester=${semester}`, 
      {}, { headers: this.headers() }
    );
  }

  // --- STUDENT: READS ---
  getMySubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/academic/my-subjects`, { headers: this.headers() });
  }
  getMyResults(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/academic/results`, { headers: this.headers() });
  }
  getMyGpa(): Observable<any> {
    return this.http.get(`${this.api}/academic/gpa`, { headers: this.headers() });
  }
}