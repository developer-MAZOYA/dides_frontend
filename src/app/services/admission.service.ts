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

// Course shape as the backend sends it
interface CourseDto {
  courseId?: number;
  course_id?: number;
  courseName?: string;
  course_name?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private http = inject(HttpClient);

  private readonly backend = 'http://localhost:9090';
  private readonly api = `${this.backend}/api/admissions`;

  getCourses(): Observable<Course[]> {
    return this.http.get<CourseDto[]>(`${this.backend}/courses/CoursesAll`).pipe(
      map(list =>
        list
          .filter(c => c.active !== false)
          .map(c => ({
            id: Number(c.courseId ?? c.course_id),
            name: c.courseName ?? c.course_name ?? 'Unnamed course',
          }))
          .filter(c => Number.isFinite(c.id)),
      ),
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

  submit(id: number): Observable<AdmissionResponse> {
    return this.http.post<AdmissionResponse>(`${this.api}/${id}/submit`, null);
  }
}