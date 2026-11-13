import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Slide {
  title: string;
  highlight: string;
  text: string;
  image: string;
}

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent {
 slides: Slide[] = [
  {
    title: 'Training for',
    highlight: 'Public Service Excellence',
    text: 'Competency-based certificate and diploma programmes in Community Development and Agriculture Production.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_25936_20220608143229_slider2.jpg',
  },
  {
    title: 'Learning by',
    highlight: 'Doing in the Field',
    text: 'Lab sessions, field trips, and practical training that prepare students for real work in communities.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_41587_20221215142829_grad3.jpg',
  },
  {
    title: 'Apply for',
    highlight: '2026/2027 Admission',
    text: 'Applications are open for the March and September intakes. Apply online through the student portal.',
    image: 'https://dides.ac.tz/wp-content/uploads/2023/10/dides_47314_20221215142355_grad-2.jpg',
  },
];

  index = signal(0);

  constructor() {
    const timer = setInterval(() => this.next(), 6000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  next() {
    this.index.update(i => (i + 1) % this.slides.length);
  }

  prev() {
    this.index.update(i => (i - 1 + this.slides.length) % this.slides.length);
  }
}