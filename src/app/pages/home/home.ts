import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  programmes = [
  {
    title: 'Community Development',
    level: 'Certificate · Diploma',
    description: 'Empowering community members and building stronger, more connected communities.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/d4866cbf509bef5e.jpg',
  },
  {
    title: 'Agriculture Production',
    level: 'Certificate · Diploma',
    description: 'Class lessons, lab sessions, field trips, cattle training and practical farm work.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/AG.jpg',
  },
  {
    title: 'Short Courses',
    level: 'Professional training',
    description: 'Entrepreneurship and other programmes for government and private sector workers.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/featured-course.jpg',
  },
];

  features = [
    { icon: '🎓', title: 'Accredited Training', text: 'Registered by NACTVET with accreditation status.' },
    { icon: '🧪', title: 'Labs & Practice', text: 'Lab sessions and practical training in every programme.' },
    { icon: '🌾', title: 'Field Learning', text: 'Field trips and cattle training that build real-world skills.' },
    { icon: '💼', title: 'Entrepreneurship', text: 'Business and entrepreneurship skills for self-reliance.' },
  ];

  news = [
    {
      date: '16 Oct 2026',
      title: 'Dirisha la udahili mwaka wa masomo 2026/2027 kwa muhula wa mwezi wa tisa',
      text: 'Applications are open for the September 2026/2027 intake.',
      link: 'https://dides.ac.tz/?p=67608',
    },
    {
      date: '16 Oct 2026',
      title: 'Dirisha la udahili mwaka wa masomo 2026/2027 kwa muhula wa mwezi wa tatu',
      text: 'Applications are open for the March 2026/2027 intake.',
      link: 'https://dides.ac.tz/?p=67609',
    },
  ];
  gallery = [
  {
    src: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_41587_20221215142829_grad3.jpg',
    caption: 'Third graduation ceremony',
    wide: true,
  },
  {
    src: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_45953_20221215141931_grad1.jpg',
    caption: 'Graduates together',
    wide: false,
  },
  {
    src: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_47314_20221215142355_grad-2.jpg',
    caption: 'Chief guest at graduation',
    wide: false,
  },
  {
    src: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_25936_20220608143229_slider2.jpg',
    caption: 'Staff and students',
    wide: false,
  },
];
}