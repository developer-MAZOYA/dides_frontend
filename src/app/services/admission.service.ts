import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AdmissionResponse,
  AdmissionSummary,
  Course,
  CourseSelection,
  EducationRow,
  NextOfKin,
  PersonalInfo,
  Sponsor,
  StartRequest,
} from '../models/admission.models';

/** Body sent to PUT /api/admissions/{id}/sponsor */
export type SponsorStep =
  | { hasSponsor: true; sponsor: Sponsor }
  | { hasSponsor: false; sponsor: null };

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private http = inject(HttpClient);

  private readonly backend = 'http://localhost:9090';
  private readonly api = `${this.backend}/api/admissions`;

  getCourses(): Observable<Course[]> {
    return this.http
      .get(`${this.backend}/courses/CoursesAll`, { responseType: 'text' })
      .pipe(
        map(raw => {
          const safe = raw.replace(
            /"(courseId|course_id|id)"\s*:\s*(\d{10,})/g,
            '"$1":"$2"',
          );
          const list = JSON.parse(safe) as Array<Record<string, unknown>>;
          return list
            .filter(c => c['active'] !== false)
            .map((c): Course => ({
              id: String(c['courseId'] ?? c['course_id'] ?? c['id'] ?? ''),
              name: String(c['courseName'] ?? c['course_name'] ?? c['name'] ?? 'Unnamed course'),
            }))
            .filter(c => c.id !== '');
        }),
      );
  }

  start(body: StartRequest): Observable<AdmissionResponse> {
    return this.http.post<AdmissionResponse>(`${this.api}/Start`, body);
  }

  findByEmail(email: string): Observable<AdmissionSummary | null> {
    return this.http.get<AdmissionSummary | null>(
      `${this.api}/email/${encodeURIComponent(email)}`,
    );
  }

  personalInfo(id: number, body: PersonalInfo): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/personal-info`, body);
  }

  nextOfKin(id: number, body: NextOfKin): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/next-of-kin`, body);
  }

  education(id: number, body: EducationRow[]): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/education`, body);
  }

  // ✅ NEW SHAPE
  sponsor(id: number, body: SponsorStep): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/sponsor`, body);
  }

  courses(id: number, body: CourseSelection): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/courses`, body);
  }

  validate(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/${id}/validate`);
  }

  listAll(): Observable<AdmissionSummary[]> {
    return this.http.get(`${this.api}`, { responseType: 'text' }).pipe(
      map(raw => {
        const safe = raw.replace(/"(\w*[iI]d|\w*Id)"\s*:\s*(\d{10,})/g, '"$1":"$2"');
        return JSON.parse(safe) as AdmissionSummary[];
      }),
    );
  }

  submit(id: number, body: { agreeTermsOfDides: boolean }): Observable<AdmissionResponse> {
    return this.http.post<AdmissionResponse>(`${this.api}/${id}/submit`, body);
  }

  // ---------------- STAFF DECISION ----------------

  approve(id: number, reason?: string): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/approve`, {
      reason: reason ?? null,
    });
  }

  reject(id: number, reason: string): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/reject`, { reason });
  }

  // ---------------- APPLICANT CONFIRMATION ----------------

  confirm(id: number, confirmationCode: string): Observable<AdmissionResponse> {
    return this.http.post<AdmissionResponse>(`${this.api}/${id}/confirm`, {
      confirmationCode,
    });
  }
}