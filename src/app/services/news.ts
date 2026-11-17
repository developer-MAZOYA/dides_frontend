import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;          // ISO date string
  link: string;
  image: string | null;
  category: string;
}

interface WpPost {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<{ name: string }>>;
  };
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);

  // Category 59 is "Latest News", the list shown on dides.ac.tz/?page_id=382
  private readonly endpoint =
    'https://dides.ac.tz/wp-json/wp/v2/posts?categories=59&_embed=1&orderby=date&order=desc&per_page=20';

  getNews(): Observable<NewsItem[]> {
    return this.http.get<WpPost[]>(this.endpoint).pipe(
      map(posts =>
        posts
          .map(p => this.toItem(p))
          // Skip random-looking test titles such as "slr0hwq8hz9e1ilpq"
          .filter(n => !/^[a-z0-9]{10,}$/.test(n.title)),
      ),
    );
  }

  private toItem(p: WpPost): NewsItem {
    return {
      id: p.id,
      title: this.text(p.title.rendered),
      excerpt: this.text(p.excerpt.rendered).replace(/\[…\]|\[\.\.\.\]/g, '…'),
      date: p.date,
      link: p.link,
      image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
      category: p._embedded?.['wp:term']?.[0]?.[0]?.name ?? 'News',
    };
  }

  /** Converts WordPress HTML to plain text. DOMParser does not run scripts. */
  private text(html: string): string {
    const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
}