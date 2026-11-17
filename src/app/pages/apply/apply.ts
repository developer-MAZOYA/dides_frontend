import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ApplyStep {
  title: string;
  text: string;
}

@Component({
  selector: 'app-apply',
  imports: [RouterLink],
  templateUrl: './apply.html',
  styleUrl: './apply.scss',
})
export class ApplyComponent {
  readonly applyUrl = '/admission';
  readonly intake = 'September Intake 2026/2027';

  steps: ApplyStep[] = [
    {
      title: 'Read the instructions',
      text: 'Check the Certificate and Diploma programmes offered for the 2026/2027 academic year.',
    },
    {
      title: 'Create an account or log in',
      text: 'New applicants create an account. Returning applicants log in with their index number.',
    },
    {
      title: 'Complete your application',
      text: 'Fill in correct information in every section. Errors can delay your admission.',
    },
    {
      title: 'Confirm your admission',
      text: 'Use the confirmation code sent to your phone to confirm your place at DIDES.',
    },
  ];
}