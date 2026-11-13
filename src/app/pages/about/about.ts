import { Component } from '@angular/core';

interface StaffMember {
  name: string;
  role: string;
  photo: string;
}

@Component({
  selector: 'app-about',
  template: `
    <section class="container">
      <h1>About Us</h1>

      <h2>Background</h2>
      <p>
        The Dodoma Institute of Development and Entrepreneurship Studies (DIDES) is registered by NACTVET
        with accreditation status. The institute is located at Nzuguni Ward, about 2 kilometres from the
        Dodoma Bus Terminal.
      </p>
      <p>
        DIDES is registered to offer technical training at Certificate and Ordinary Diploma level in
        Community Development and Agriculture Production. It also provides short courses and seminars for
        government officials and other public and private workers. The institute plans to offer degrees
        in the future.
      </p>

      <div class="vm-grid">
        <div class="card">
          <h2>Our Vision</h2>
          <p>
            To be a centre of excellence in public administration studies and other public service related
            disciplines in the country.
          </p>
        </div>
        <div class="card">
          <h2>Our Mission</h2>
          <p>
            To engage in excellent teaching, improve the efficiency and effectiveness of public administration
            in Tanzania by providing comprehensive, competency-based training and applied research.
          </p>
        </div>
      </div>

      <h2>Management</h2>
      <div class="cards">
        @for (member of staff; track member.name) {
          <article class="card staff">
            <img [src]="member.photo" [alt]="member.name" />
            <h3>{{ member.name }}</h3>
            <p>{{ member.role }}</p>
          </article>
        }
      </div>
    </section>
  `,
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