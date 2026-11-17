import { Routes } from '@angular/router';
import { authGuard, dashboardGuard, permissionGuard, roleGuard } from './guards/auth.guard';
import { PublicLayoutComponent } from './layouts/public-layout';

export const routes: Routes = [
  // ... public routes remain the same ...
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent), title: 'DIDES | Home' },
      { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent), title: 'About Us | DIDES' },
      { path: 'programmes', loadComponent: () => import('./pages/programmes/programmes').then(m => m.ProgrammesComponent), title: 'Programmes | DIDES' },
      { path: 'news', loadComponent: () => import('./pages/news/news').then(m => m.NewsComponent), title: 'News | DIDES' },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent), title: 'Contact | DIDES' },
      { path: 'apply', loadComponent: () => import('./pages/apply/apply').then(m => m.ApplyComponent), title: 'Apply | DIDES' },
    ],
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
    title: 'Sign in | DIDES',
  },

  // ---------- Dashboards ----------
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-shell').then(m => m.DashboardShellComponent),
    canActivate: [authGuard],
    children: [
      // Redirect /dashboard to role-specific home
      { path: '', pathMatch: 'full', canActivate: [dashboardGuard], children: [] },
      
      // ✅ STUDENT DASHBOARD (Fixed to use roleGuard)
      {
        path: 'student',
        canActivate: [roleGuard],
        data: { roles: ['STUDENT'] },
        loadComponent: () => import('./pages/dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
        title: 'My account | DIDES',
      },

      // ✅ ADMIN DASHBOARD
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
        loadComponent: () => import('./pages/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard | DIDES',
      },
      
      // Users Management
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: ['USER_READ'] },
        loadComponent: () => import('./pages/dashboard/staff-dashboard').then(m => m.StaffDashboardComponent),
        title: 'User Management | DIDES',
      },
      
      // Admissions Management
      {
        path: 'admissions',
        canActivate: [permissionGuard],
        data: { permissions: ['ADMISSION_READ'] },
        loadComponent: () => import('./pages/dashboard/admissions-list').then(m => m.AdmissionsListComponent),
        title: 'All admissions | DIDES',
      },
    ],
  },

  // ... portal routes remain the same ...
  {
    path: 'portal',
    loadComponent: () => import('./pages/portal/portal-shell').then(m => m.PortalShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/portal/portal-dashboard').then(m => m.PortalDashboardComponent), title: 'Admissions Portal | DIDES' },
      { path: 'apply', loadComponent: () => import('./pages/admission/admission').then(m => m.AdmissionComponent), title: 'Apply for Admission | DIDES' },
      { path: 'status', loadComponent: () => import('./pages/portal/portal-status').then(m => m.PortalStatusComponent), title: 'Check Status | DIDES' },
      { path: 'announcements', loadComponent: () => import('./pages/portal/portal-announcements').then(m => m.PortalAnnouncementsComponent), title: 'Announcements | DIDES' },
      { path: 'forms', loadComponent: () => import('./pages/portal/portal-forms').then(m => m.PortalFormsComponent), title: 'Forms & Requirements | DIDES' },
    ],
  },

  { path: 'admission', redirectTo: 'portal/apply', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];