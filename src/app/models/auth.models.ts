export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  permissions: string[];
}

export interface Session {
  token: string;
  username: string;
  roles: string[];       // e.g. ['ADMIN']
  role: string;          // the primary role, used for the dashboard
  permissions: string[]; // e.g. ['USER_READ', 'ROLE_MANAGE']
}

/** A user as returned by the backend. IDs are strings so large values are not rounded. */
export interface AppUser {
  id: string;
  [key: string]: unknown;
}

/** Must match the backend Roles enum. */
export const ROLE_OPTIONS = ['STUDENT', 'ADMISSIONUSER', 'STAFF', 'DIRECTOR', 'ADMIN'] as const;