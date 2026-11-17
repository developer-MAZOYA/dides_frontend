import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FormSection {
  title: string;
  optional?: boolean;
  fields: string[];
}

@Component({
  selector: 'app-portal-forms',
  imports: [RouterLink],
  template: `
    <div class="page-head">
      <span class="section-tag">Forms & requirements</span>
      <h1>What each step asks for</h1>
      <p>Have these details ready before you start. Applicants without a sponsor skip step 5.</p>
    </div>

    <div class="grid">
      @for (s of sections; track s.title) {
        <article class="p-card">
          <div class="head">
            <h2>{{ s.title }}</h2>
            @if (s.optional) {
              <span class="opt">Optional</span>
            }
          </div>
          <ul>
            @for (f of s.fields; track f) {
              <li>{{ f }}</li>
            }
          </ul>
          <a routerLink="/portal/apply" class="open">Open this step →</a>
        </article>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }

    .opt {
      background: var(--sky);
      color: var(--deep);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
    }

    ul {
      margin: 0 0 1rem;
      padding-left: 1.1rem;
      color: var(--text);

      li { margin-bottom: 0.35rem; }
    }

    .open {
      color: var(--purple);
      font-weight: 700;
      text-decoration: none;
    }
  `],
})
export class PortalFormsComponent {
  sections: FormSection[] = [
    { title: '1. Start', fields: ['First name', 'Last name', 'Email address'] },
    {
      title: '2. Personal information',
      fields: ['Mobile number', 'Date of birth', 'Sex', 'Marital status', 'Citizenship', 'Home address', 'Contact address', 'Disability (yes or no)'],
    },
    { title: '3. Next of kin', fields: ['Full name', 'Mobile number', 'Residence', 'Relationship to you'] },
    {
      title: '4. Education',
      fields: ['Qualification (PSLE, CSEE or ACSEE)', 'School name', 'From year and to year', 'Country', 'Division or grade', 'Index number'],
    },
    {
      title: '5. Sponsorship',
      optional: true,
      fields: ['Sponsor type', 'Sponsor name, postal address, phone and email', 'Applicant name and institution', 'Agreement to DIDES terms'],
    },
    { title: '6. Courses', fields: ['At least one programme you want to apply for'] },
    { title: '7. Review and submit', fields: ['Check every section', 'Submit the application'] },
  ];
}