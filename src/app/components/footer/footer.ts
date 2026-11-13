import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterLink {
  label: string;
  url: string;
  external: boolean;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  year = new Date().getFullYear();

  quickLinks: FooterLink[] = [
    { label: 'About Us', url: '/about', external: false },
    { label: 'Programmes', url: '/programmes', external: false },
    { label: 'News', url: '/news', external: false },
    { label: 'Contact Us', url: '/contact', external: false },
    { label: 'Apply Now', url: '/apply', external: false },
    { label: 'Academic Results', url: 'https://dides.ac.tz/dis/results/index', external: true },
    { label: 'Staff Login', url: 'https://dides.ac.tz/dis/index', external: true },
  ];

  programmes = ['Community Development', 'Agriculture Production', 'Short Courses'];

  partners: FooterLink[] = [
    { label: 'NACTE', url: 'https://www.nacte.go.tz/', external: true },
    { label: 'NECTA', url: 'https://www.necta.go.tz/', external: true },
    { label: 'VETA', url: 'https://www.veta.go.tz/', external: true },
  ];
}