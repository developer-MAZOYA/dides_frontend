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
  title: 'Apply for Admission | DIDES',
  },
  {
  path: 'admission',
  loadComponent: () => import('./pages/admission/admission').then(m => m.AdmissionComponent),
  title: 'Online Admission | DIDES',
},
  { path: '**', redirectTo: '' },
];