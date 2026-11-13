import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WpPost {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://dides.ac.tz/wp-json/wp/v2/posts?per_page=10';

  getLatest(): Observable<WpPost[]> {
    return this.http.get<WpPost[]>(this.apiUrl);
  }
}