export interface AdmissionResponse {
  id?: number;
  [key: string]: unknown;
}

export interface StartRequest {
  email: string;
  firstname: string;
  lastname: string;
}

export interface PersonalInfo {
  id?: number;
  firstname: string;
  lastname: string;
  disability: boolean;
  maritalStatus: string;
  dateOfBirth: string;
  sex: string;
  citizenship: string;
  homeAddress: string;
  mobileNumber: string;
  email: string;
  contactAddress: string;
}

export interface NextOfKin {
  name: string;
  mobileNumber: string;
  residence: string;
  relationship: string;
}

export interface EducationRow {
  qualificationType: string;
  fromYear: number;
  toYear: number;
  schoolName: string;
  country: string;
  division: string;
  indexNumber: string;
}

export interface Sponsor {
  sponsorType: string;
  sponsorFullName: string;
  sponsorPostalAddress: string;
  sponsorMobileNumber: string;
  sponsorEmailAddress: string;
  applicantName: string;
  institutionName: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface CourseSelection {
  selectedCourseIds: string[];
}

export interface DraftPersonalInfo {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  disability?: boolean;
  maritalStatus?: string | null;
  dateOfBirth?: string | null;
  sex?: string | null;
  citizenship?: string | null;
  homeAddress?: string | null;
  mobileNumber?: string | null;
  contactAddress?: string | null;
}

export interface AdmissionSummary {
  admissionId?: number;
  applicationNumber?: string;
  personalInfo?: DraftPersonalInfo | null;
  currentStep?: string | null;
  current_step?: string | null;
  status?: string | null;
  submittedAt?: string | null;
  nextOfKin?: unknown;
  educationBackgrounds?: unknown[] | null;
  sponsor?: unknown;
  selectedCourses?: unknown[] | null;

  hasSponsor?: boolean;
  agreeTermsOfDides?: boolean;

  decisionAt?: string | null;
  decisionBy?: string | null;
  decisionReason?: string | null;
  confirmedAt?: string | null;
  confirmationCode?: string | null;

}