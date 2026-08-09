import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import type { BlogPost } from '../../core/models';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
})
export class BlogDetailComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly post = signal<BlogPost | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.getPost(slug).subscribe({
      next: (post) => this.post.set(post),
      error: () => this.post.set(null),
    });
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  title(): string {
    const post = this.post();
    if (!post) return '';
    return this.i18n.lang() === 'es' ? post.titleEs : post.titleEn;
  }

  content(): string {
    const post = this.post();
    if (!post) return '';
    return this.i18n.lang() === 'es' ? post.contentEs : post.contentEn;
  }
}
