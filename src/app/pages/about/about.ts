import { Component } from '@angular/core';

interface StaffMember {
  name: string;
  role: string;
  photo: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {
  staff: StaffMember[] = [
    {
      name: 'Dr. Upendo Swai',
      role: 'Director',
      photo: 'https://dides.ac.tz/wp-content/uploads/2023/11/director-removebg-preview-e1701156442481.png',
    },
    {
      name: 'Grace N. John',
      role: 'Acting Principal, Deputy Principal Planning, Finance & Administration',
      photo: 'https://dides.ac.tz/wp-content/uploads/2023/11/25C0459-scaled.jpg',
    },
    {
      name: 'Philbert Mushumba',
      role: 'Deputy Principal Academic, Research & Consultancy',
      photo: 'https://dides.ac.tz/wp-content/uploads/2023/11/25C0491-scaled.jpg',
    },
    {
      name: 'Neema S. Kishebuka',
      role: 'Head of the Department of Agriculture',
      photo: 'https://dides.ac.tz/wp-content/uploads/2023/11/25C0466-scaled.jpg',
    },
    {
      name: 'Hussein Mrisho',
      role: 'Head of Department of Community Development',
      photo: 'https://dides.ac.tz/wp-content/uploads/2023/11/25C0467-scaled.jpg',
    },
  ];
}