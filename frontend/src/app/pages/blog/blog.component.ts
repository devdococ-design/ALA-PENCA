import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import type { BlogPost } from '../../core/models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  readonly posts = signal<BlogPost[]>([]);

  ngOnInit(): void {
    this.api.getPosts().subscribe({
      next: (posts) => this.posts.set(posts),
      error: () => this.posts.set([]),
    });
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  title(post: BlogPost): string {
    return this.i18n.lang() === 'es' ? post.titleEs : post.titleEn;
  }

  excerpt(post: BlogPost): string {
    return this.i18n.lang() === 'es' ? post.excerptEs : post.excerptEn;
  }
}
