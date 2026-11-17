import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NewsItem, NewsService } from '../../services/news';

/** Posts copied from dides.ac.tz/?page_id=382, used only if the live request fails. */
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 67608,
    title: 'DIRISHA LA UDAHILI MWAKA WA MASOMO 2026/2027 KWA MUHULA WA MWEZI WA TISA.',
    excerpt: 'Dirisha la maombi ya kujiunga na Astashahada na Stashahada kwa muhula wa mwezi wa tisa liko wazi.',
    date: '2026-10-16',
    link: 'https://dides.ac.tz/?p=67608',
    image: 'https://dides.ac.tz/wp-content/uploads/2026/10/September-Intake-Admission-Banner-1150x600.png',
    category: 'Latest News',
  },
  {
    id: 67609,
    title: 'DIRISHA LA UDAHILI MWAKA WA MASOMO 2026/2027 KWA MUHULA WA MWEZI WA TATU.',
    excerpt: 'Dirisha la maombi ya kujiunga na mafunzo kwa muhula wa mwezi wa tatu liko wazi.',
    date: '2026-10-16',
    link: 'https://dides.ac.tz/?p=67609',
    image: null,
    category: 'Latest News',
  },
  {
    id: 8159,
    title: 'DIRISHA LA UDAHILI MWAKA WA MASOMO 2025/2026 KWA MUHULA WA MWEZI WA TISA.',
    excerpt: 'Dirisha la maombi ya kujiunga na mafunzo kwa muhula wa mwezi wa tisa liko wazi.',
    date: '2025-06-17',
    link: 'https://dides.ac.tz/?p=8159',
    image: 'https://dides.ac.tz/wp-content/uploads/2025/06/September-Intake.png',
    category: 'Latest News',
  },
  {
    id: 6818,
    title: 'RELEASE OF ACADEMIC RESULTS',
    excerpt: 'The Principal has released academic results for the current batches. Results are on the DIDES information system.',
    date: '2023-10-19',
    link: 'https://dides.ac.tz/?p=6818',
    image: 'https://dides.ac.tz/wp-content/uploads/revslider/home3/dides_47314_20221215142355_grad-2-918x600.png',
    category: 'Latest News',
  },
];

@Component({
  selector: 'app-news',
  imports: [DatePipe],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class NewsComponent {
  private newsService = inject(NewsService);

  readonly skeletons = [1, 2, 3, 4, 5, 6];

  items = signal<NewsItem[]>([]);
  query = signal('');
  loading = signal(true);
  error = signal<string | null>(null);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(n =>
      (n.title + ' ' + n.excerpt).toLowerCase().includes(q),
    );
  });

  featured = computed(() => this.filtered()[0] ?? null);
  rest = computed(() => this.filtered().slice(1));

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.newsService.getNews().subscribe({
      next: list => {
        this.items.set(list.length ? list : FALLBACK_NEWS);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.warn('Live news unavailable, showing saved posts:', err.status, err.url);
        this.items.set(FALLBACK_NEWS);
        this.loading.set(false);
      },
    });
  }

  retry() {
    this.load();
  }

  onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }
}