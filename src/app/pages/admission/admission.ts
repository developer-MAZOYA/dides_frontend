import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdmissionService } from '../../services/admission.service';
import {
  AdmissionSummary,
  Course,
  EducationRow,
  PersonalInfo,
} from '../../models/admission.models';

type StepKey = 'start' | 'personal' | 'kin' | 'education' | 'sponsor' | 'courses' | 'review';

const STEPS: StepKey[] = ['start', 'personal', 'kin', 'education', 'sponsor', 'courses', 'review'];

@Component({
  selector: 'app-admission',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admission.html',
  styleUrl: './admission.scss',
})
export class AdmissionComponent implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private api = inject(AdmissionService);
  private route = inject(ActivatedRoute);

  readonly steps = STEPS;
  readonly labels: Record<StepKey, string> = {
    start: 'Start',
    personal: 'Personal',
    kin: 'Next of kin',
    education: 'Education',
    sponsor: 'Sponsor',
    courses: 'Courses',
    review: 'Review',
  };

  readonly maritalOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];
  readonly sexOptions = ['MALE', 'FEMALE'];
  readonly qualificationOptions = ['PSLE', 'CSEE', 'ACSEE'];
  readonly sponsorTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private company' },
    { value: 'other', label: 'Other (parent, guardian, organisation or self)' },
  ];
  readonly relationships = ['Parent', 'Sibling', 'Spouse', 'Guardian', 'Other'];

  // Forms
  resumeForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  startForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  personalForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    disability: [false],
    maritalStatus: ['SINGLE', Validators.required],
    dateOfBirth: ['', Validators.required],
    sex: ['', Validators.required],
    citizenship: ['Tanzanian', Validators.required],
    homeAddress: ['', Validators.required],
    mobileNumber: ['', Validators.required],
    contactAddress: ['', Validators.required],
  });

  kinForm = this.fb.group({
    name: ['', Validators.required],
    mobileNumber: ['', Validators.required],
    residence: ['', Validators.required],
    relationship: ['', Validators.required],
  });

  educationForm = this.fb.group({
    rows: this.fb.array<FormGroup>([this.newEduRow()]),
  });

  // The terms checkbox is on the Review step, not here
  sponsorForm = this.fb.group({
    sponsorType: ['', Validators.required],
    sponsorFullName: ['', Validators.required],
    sponsorPostalAddress: ['', Validators.required],
    sponsorMobileNumber: ['', Validators.required],
    sponsorEmailAddress: ['', [Validators.required, Validators.email]],
    applicantName: ['', Validators.required],
    institutionName: ['', Validators.required],
  });

  // State
  admissionId = signal<number | null>(null);
  applicationNumber = signal<string | null>(null);
  currentStep = signal<StepKey>('start');
  hasSponsor = signal<boolean | null>(null);
  courses = signal<Course[]>([]);
  selectedCourseIds = signal<string[]>([]);
  coursesOpen = signal(false);
  termsAccepted = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  completed = signal(false);

  stepIndex = computed(() => STEPS.indexOf(this.currentStep()));

  selectedNames = computed(() =>
    this.courses()
      .filter(c => this.selectedCourseIds().includes(c.id))
      .map(c => c.name),
  );

  get rows(): FormArray {
    return this.educationForm.controls.rows as FormArray;
  }

  ngOnInit() {
    this.api.getCourses().subscribe({
      next: list => {
        this.courses.set(list);
        // Drop selections that no longer match a real course
        const validIds = new Set(list.map(c => c.id));
        this.selectedCourseIds.update(ids => ids.filter(id => validIds.has(id)));
      },
      error: err => {
        console.error('Course list failed:', err);
        this.error.set('Could not load the course list. Check that the backend is running.');
      },
    });

    // Opened from "Continue application" on the status page
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resumeForm.patchValue({ email });
      this.resume();
    }
  }

  // Continue a draft

  resume() {
    if (!this.valid(this.resumeForm)) return;
    const email = this.normaliseEmail(this.resumeForm.getRawValue().email);

    this.saving.set(true);
    this.error.set(null);

    this.api.findByEmail(email).subscribe({
      next: res => {
        this.saving.set(false);
        this.loadDraft(res);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 404) {
          this.error.set('No application was found for that email.');
        } else {
          this.error.set(this.messageOf(err));
        }
      },
    });
  }

  private loadDraft(res: AdmissionSummary | null) {
    if (!res) {
      this.error.set('No application was found for that email.');
      return;
    }

    const status = String(res.status ?? '').toUpperCase();
    if (res.submittedAt || status.includes('SUBMIT')) {
      this.error.set('This application has already been submitted and cannot be edited here.');
      return;
    }

    const id = this.extractId(res);
    if (id === null) {
      this.error.set('Found the application but could not read its number. Check the backend response.');
      return;
    }

    this.admissionId.set(id);
    this.applicationNumber.set(res.applicationNumber ?? null);

    // Restore personal details, converting the backend timestamp to yyyy-MM-dd
    const p = res.personalInfo;
    if (p) {
      this.personalForm.patchValue({
        firstname: p.firstname ?? '',
        lastname: p.lastname ?? '',
        email: p.email ?? '',
        disability: p.disability ?? false,
        maritalStatus: p.maritalStatus ?? 'SINGLE',
        dateOfBirth: this.toDateInput(p.dateOfBirth),
        sex: p.sex ?? '',
        citizenship: p.citizenship ?? 'Tanzanian',
        homeAddress: p.homeAddress ?? '',
        mobileNumber: p.mobileNumber ?? '',
        contactAddress: p.contactAddress ?? '',
      });
    }

    // Restore course selections as strings so large IDs are not rounded
    const picked = (res.selectedCourses ?? []) as Array<Record<string, unknown>>;
    const pickedIds = picked
      .map(c => String(c['id'] ?? c['courseId'] ?? c['course_id'] ?? ''))
      .filter(id => id !== '');
    this.selectedCourseIds.set(pickedIds);

    if (res.sponsor) {
      this.hasSponsor.set(true);
    }

    this.resumeForm.reset();
    this.go(this.nextStepFor(res));
  }

  /** Decides which step to open. Uses the saved step if the backend has one, otherwise infers it from saved data. */
  private nextStepFor(res: AdmissionSummary): StepKey {
    const explicit = res.currentStep ?? res.current_step;
    if (explicit) {
      return this.stepAfter(explicit);
    }

    const p = res.personalInfo;
    const personalDone = !!(p?.sex && p?.dateOfBirth && p?.homeAddress);
    if (!personalDone) return 'personal';
    if (!res.nextOfKin) return 'kin';
    if (!res.educationBackgrounds?.length) return 'education';
    // Sponsor is optional: only ask for it if the applicant has not already skipped it
    if (!res.sponsor && this.hasSponsor() !== false) return 'sponsor';
    if (!res.selectedCourses?.length) return 'courses';
    return 'review';
  }

  /** Maps a saved step name to the step the applicant should fill next. */
  private stepAfter(raw: string): StepKey {
    const s = raw.toUpperCase().replace(/[^A-Z]/g, '');

    if (s.includes('REVIEW') || s.includes('COURSE')) return 'review';
    if (s.includes('SPONSOR')) return 'courses';
    if (s.includes('EDUC')) return 'sponsor';
    if (s.includes('KIN')) return 'education';
    if (s.includes('PERSONAL')) return 'kin';
    return 'personal';
  }

  private toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  // Navigation

  back() {
    if (this.stepIndex() > 0) {
      this.go(STEPS[this.stepIndex() - 1]);
    }
  }

  private go(step: StepKey) {
    this.error.set(null);
    this.coursesOpen.set(false);
    this.currentStep.set(step);
  }

  // Step actions

  saveStart() {
    if (!this.valid(this.startForm)) return;
    const raw = this.startForm.getRawValue();
    const body = { ...raw, email: this.normaliseEmail(raw.email) };

    this.run(this.api.start(body), res => {
      const id = this.extractId(res);
      if (id === null) {
        this.error.set('The server created the application but did not return its number. Check the backend Start endpoint.');
        return;
      }
      this.admissionId.set(id);
      this.applicationNumber.set((res as unknown as AdmissionSummary).applicationNumber ?? null);
      this.personalForm.patchValue(body);
      this.go('personal');
    });
  }

  savePersonal() {
    if (!this.valid(this.personalForm)) return;
    const id = this.requireId();
    if (id === null) return;

    const v = this.personalForm.getRawValue();

    // No `id` in the body. The admission is identified by the URL path.
    const body: PersonalInfo = {
      firstname: v.firstname,
      lastname: v.lastname,
      email: v.email,
      disability: v.disability,
      maritalStatus: v.maritalStatus,
      dateOfBirth: v.dateOfBirth,
      sex: v.sex,
      citizenship: v.citizenship,
      homeAddress: v.homeAddress,
      mobileNumber: v.mobileNumber,
      contactAddress: v.contactAddress,
    };

    this.run(this.api.personalInfo(id, body), () => this.go('kin'));
  }

  saveKin() {
    if (!this.valid(this.kinForm)) return;
    const id = this.requireId();
    if (id === null) return;

    this.run(this.api.nextOfKin(id, this.kinForm.getRawValue()), () => this.go('education'));
  }

  addRow() {
    this.rows.push(this.newEduRow());
  }

  removeRow(index: number) {
    this.rows.removeAt(index);
  }

  saveEducation() {
    if (!this.valid(this.educationForm)) return;
    const id = this.requireId();
    if (id === null) return;

    const rows = this.rows.getRawValue() as EducationRow[];

    if (rows.some(r => r.toYear < r.fromYear)) {
      this.error.set('End year cannot be earlier than start year.');
      return;
    }

    this.run(this.api.education(id, rows), () => this.go('sponsor'));
  }

  skipSponsor() {
    // Nothing is sent to the backend. The applicant simply has no sponsor.
    this.hasSponsor.set(false);
    this.go('courses');
  }

  saveSponsor() {
    if (!this.valid(this.sponsorForm)) return;
    const id = this.requireId();
    if (id === null) return;

    this.run(this.api.sponsor(id, this.sponsorForm.getRawValue()), () => {
      this.hasSponsor.set(true);
      this.go('courses');
    });
  }

  // Course dropdown

  toggleDropdown() {
    this.coursesOpen.update(open => !open);
  }

  closeDropdown() {
    this.coursesOpen.set(false);
  }

  isSelected(id: string): boolean {
    return this.selectedCourseIds().includes(id);
  }

  toggleCourse(id: string, checked: boolean) {
    this.selectedCourseIds.update(ids =>
      checked ? [...new Set([...ids, id])] : ids.filter(x => x !== id),
    );
  }

  saveCourses() {
    if (this.selectedCourseIds().length === 0) {
      this.error.set('Select at least one course.');
      return;
    }
    const id = this.requireId();
    if (id === null) return;

    this.run(
      this.api.courses(id, { selectedCourseIds: this.selectedCourseIds() }),
      () => this.go('review'),
    );
  }

  // Review and submit

  submit() {
    if (!this.termsAccepted()) {
      this.error.set('Please tick the terms and conditions before submitting.');
      return;
    }

    const id = this.requireId();
    if (id === null) return;

    this.run(this.api.validate(id), valid => {
      if (!valid) {
        this.error.set('Some sections are incomplete. Please review each step before submitting.');
        return;
      }
      this.run(this.api.submit(id, { agreeTermsOfDides: true }), () => this.completed.set(true));
    });
  }

  // Helpers

  bad(form: FormGroup, key: string): boolean {
    const control = form.get(key);
    return !!control && control.invalid && control.touched;
  }

  private newEduRow(): FormGroup {
    return this.fb.group({
      qualificationType: ['', Validators.required],
      fromYear: [0, [Validators.required, Validators.min(1900)]],
      toYear: [0, [Validators.required, Validators.min(1900)]],
      schoolName: ['', Validators.required],
      country: ['Tanzania', Validators.required],
      division: ['', Validators.required],
      indexNumber: ['', Validators.required],
    });
  }

  private normaliseEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  private valid(form: FormGroup): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      this.error.set('Please fill in all required fields.');
      return false;
    }
    this.error.set(null);
    return true;
  }

  /** Returns the admission ID, or shows an error and returns null if Start has not run. */
  private requireId(): number | null {
    const id = this.admissionId();
    if (id === null) {
      this.error.set('Start the application first (step 1).');
      this.currentStep.set('start');
      return null;
    }
    return id;
  }

  /** Finds the admission ID in the response, whatever the backend calls it. */
  private extractId(res: unknown): number | null {
    const r = (res ?? {}) as Record<string, unknown>;
    const candidates = ['admissionId', 'id', 'applicationId', 'admission_id'];

    for (const key of candidates) {
      const value = r[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && /^\d+$/.test(value)) {
        return Number(value);
      }
    }

    console.error('Response had no usable ID. Response was:', res);
    return null;
  }

  private run<T>(request: Observable<T>, onSuccess: (res: T) => void) {
    this.saving.set(true);
    this.error.set(null);

    request.subscribe({
      next: res => {
        this.saving.set(false);
        onSuccess(res);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.messageOf(err));
      },
    });
  }

  private messageOf(err: HttpErrorResponse): string {
    console.error('Admission request failed:', err.status, err.url, err.error);

    if (err.status === 0) {
      return 'Cannot reach the server. Check that the backend is running on port 9090 and that CORS allows http://localhost:4200.';
    }

    const body = err.error;

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (body && typeof body === 'object') {
      const msg = body.message ?? body.error ?? body.detail;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }

    return `Server returned ${err.status} ${err.statusText || ''} for ${err.url}. Check the backend console for the cause.`;
  }
}