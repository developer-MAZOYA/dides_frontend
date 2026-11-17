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

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private http = inject(HttpClient);

  private readonly backend = 'http://localhost:9090';
  private readonly api = `${this.backend}/api/admissions`;

  /**
   * Course IDs can exceed JavaScript's safe integer limit, so the response is
   * read as text and long IDs are quoted before parsing. Every ID stays a string.
   */
  getCourses(): Observable<Course[]> {
    return this.http
      .get(`${this.backend}/courses/CoursesAll`, { responseType: 'text' })
      .pipe(
        map(raw => {
          // Quote long numeric IDs so JSON.parse keeps every digit
          const safe = raw.replace(
            /"(courseId|course_id|id)"\s*:\s*(\d{10,})/g,
            '"$1":"$2"',
          );

          const list = JSON.parse(safe) as Array<Record<string, unknown>>;

          return list
            .filter(c => c['active'] !== false)
            .map((c): Course => ({
              id: String(c['courseId'] ?? c['course_id'] ?? c['id'] ?? ''),
              name: String(c['courseName'] ?? c['course_name'] ?? 'Unnamed course'),
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

  sponsor(id: number, body: Sponsor): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/sponsor`, body);
  }

  courses(id: number, body: CourseSelection): Observable<AdmissionResponse> {
    return this.http.put<AdmissionResponse>(`${this.api}/${id}/courses`, body);
  }

  validate(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/${id}/validate`);
  }
/** GET /api/admissions. Returns every application. Large IDs are kept as strings. */
listAll(): Observable<AdmissionSummary[]> {
  return this.http.get(`${this.api}`, { responseType: 'text' }).pipe(
    map(raw => {
      // Quote any ID-like number with 10+ digits so JSON.parse keeps every digit
      const safe = raw.replace(/"(\w*[iI]d|\w*Id)"\s*:\s*(\d{10,})/g, '"$1":"$2"');
      return JSON.parse(safe) as AdmissionSummary[];
    }),
  );
}
  submit(id: number, body: { agreeTermsOfDides: boolean }): Observable<AdmissionResponse> {
    return this.http.post<AdmissionResponse>(`${this.api}/${id}/submit`, body);
  }
}