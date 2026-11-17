export interface Announcement {
  date: string;
  title: string;
  body: string;
  link?: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    date: '16 Oct 2026',
    title: 'Applications open for the September 2026/2027 intake',
    body: 'The Principal invites all qualified candidates to apply for Certificate and Diploma programmes for the academic year 2026/2027.',
    link: 'https://dides.ac.tz/?p=67608',
  },
  {
    date: '16 Oct 2026',
    title: 'Applications open for the March 2026/2027 intake',
    body: 'Candidates for the March intake can apply through the online admission portal.',
    link: 'https://dides.ac.tz/?p=67609',
  },
  {
    date: 'Ongoing',
    title: 'Help Desk available during the application period',
    body: 'If you have a problem during the application, call 0685 506 450 or 0679 550 047.',
  },
];