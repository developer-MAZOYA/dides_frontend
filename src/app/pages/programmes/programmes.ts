import { Component } from '@angular/core';

interface Programme {
  department: string;
  levels: string[];
  description: string;
}

@Component({
  selector: 'app-programmes',
  template: `
    <section class="container">
      <h1>Programmes</h1>

      @for (p of programmes; track p.department) {
        <article class="programme">
          <h2>{{ p.department }}</h2>
          <p>{{ p.description }}</p>
          <ul>
            @for (level of p.levels; track level) {
              <li>{{ level }}</li>
            }
          </ul>
        </article>
      }
    </section>
  `,
})
export class ProgrammesComponent {
  programmes: Programme[] = [
    {
      department: 'Community Development',
      description: 'Training for community development practice at certificate and diploma level.',
      levels: ['Basic Technician Certificate', 'Technician Certificate', 'Ordinary Diploma'],
    },
    {
      department: 'Agriculture Production',
      description: 'Practical agricultural training combining classroom, laboratory and field work.',
      levels: ['Basic Technician Certificate', 'Technician Certificate', 'Ordinary Diploma'],
    },
  ];
}