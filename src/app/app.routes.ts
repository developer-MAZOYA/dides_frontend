import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    title: 'DIDES | Home',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent),
    title: 'About Us | DIDES',
  },
  {
    path: 'programmes',
    loadComponent: () => import('./pages/programmes/programmes').then(m => m.ProgrammesComponent),
    title: 'Programmes | DIDES',
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news').then(m => m.NewsComponent),
    title: 'News | DIDES',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent),
    title: 'Contact | DIDES',
  },
  {
    path: 'apply',
    loadComponent: () => import('./pages/apply/apply').then(m => m.ApplyComponent),
    title: 'Apply | DIDES',
  },
  {
    path: 'portal',
    loadComponent: () => import('./pages/portal/portal-shell').then(m => m.PortalShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/portal/portal-dashboard').then(m => m.PortalDashboardComponent),
        title: 'Admissions Portal | DIDES',
      },
      {
        path: 'apply',
        loadComponent: () => import('./pages/admission/admission').then(m => m.AdmissionComponent),
        title: 'Apply for Admission | DIDES',
      },
      {
        path: 'status',
        loadComponent: () => import('./pages/portal/portal-status').then(m => m.PortalStatusComponent),
        title: 'Check Status | DIDES',
      },
      {
        path: 'announcements',
        loadComponent: () => import('./pages/portal/portal-announcements').then(m => m.PortalAnnouncementsComponent),
        title: 'Announcements | DIDES',
      },
      {
        path: 'forms',
        loadComponent: () => import('./pages/portal/portal-forms').then(m => m.PortalFormsComponent),
        title: 'Forms & Requirements | DIDES',
      },
    ],
  },
  { path: 'admission', redirectTo: 'portal/apply', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];