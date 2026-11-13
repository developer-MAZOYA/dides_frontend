import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-news',
  imports: [AsyncPipe, DatePipe],
  template: `
    <section class="container">
      <h1>Latest News</h1>

      @if (news$ | async; as posts) {
        @for (post of posts; track post.id) {
          <article class="news-item">
            <h3 [innerHTML]="post.title.rendered"></h3>
            <time>{{ post.date | date: 'longDate' }}</time>
            <div [innerHTML]="post.excerpt.rendered"></div>
            <a [href]="post.link" target="_blank" rel="noopener">Read more</a>
          </article>
        } @empty {
          <p>No news at the moment.</p>
        }
      } @else {
        <p>Loading news…</p>
      }
    </section>
  `,
})
export class NewsComponent {
  private newsService = inject(NewsService);
  news$ = this.newsService.getLatest();
}