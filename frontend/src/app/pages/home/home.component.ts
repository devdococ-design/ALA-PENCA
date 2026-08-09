import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { ApiService } from '../../core/api.service';
import type { BlogPost, GalleryItem, Plant } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly plants = signal<Plant[]>([]);
  readonly posts = signal<BlogPost[]>([]);
  readonly gallery = signal<GalleryItem[]>([]);
  readonly lightboxItem = signal<GalleryItem | null>(null);

  constructor() {
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      this.scrollToFragment(fragment);
    });
  }

  ngOnInit(): void {
    this.api.getPlants().subscribe({
      next: (plants) => this.plants.set(plants.filter((p) => p.featured).slice(0, 3)),
      error: () => this.plants.set(this.fallbackPlants()),
    });
    this.api.getPosts().subscribe({
      next: (posts) => this.posts.set(posts.slice(0, 8)),
      error: () => this.posts.set(this.fallbackPosts()),
    });
    this.api.getGallery().subscribe({
      next: (items) => this.gallery.set(items),
      error: () => this.gallery.set(this.fallbackGallery()),
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }

  t(path: string): string {
    return this.i18n.t(path);
  }

  faqs() {
    return this.i18n.list('faq.items');
  }

  private scrollToFragment(fragment: string | null): void {
    if (!fragment) return;

    const tryScroll = (attemptsLeft: number): void => {
      const el = document.getElementById(fragment);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attemptsLeft > 0) {
        requestAnimationFrame(() => tryScroll(attemptsLeft - 1));
      }
    };

    setTimeout(() => tryScroll(40), 80);
  }

  mediaUrl(path: string): string {
    return this.api.mediaUrl(path);
  }

  galleryDescription(item: GalleryItem): string {
    return this.i18n.lang() === 'es' ? item.descriptionEs : item.descriptionEn;
  }

  openLightbox(item: GalleryItem): void {
    this.lightboxItem.set(item);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
    document.body.style.overflow = '';
  }

  plantName(plant: Plant): string {
    return this.i18n.plantField(plant, 'name');
  }

  postTitle(post: BlogPost): string {
    return this.i18n.lang() === 'es' ? post.titleEs : post.titleEn;
  }

  postExcerpt(post: BlogPost): string {
    return this.i18n.lang() === 'es' ? post.excerptEs : post.excerptEn;
  }

  scrollCarousel(track: HTMLElement, direction: -1 | 1): void {
    const amount = Math.max(track.clientWidth * 0.78, 240);
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  private fallbackGallery(): GalleryItem[] {
    return [
      {
        id: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=1200&q=80',
        descriptionEs: 'Interior con plantas que dan vida al espacio.',
        descriptionEn: 'An indoor corner brought to life with plants.',
        sortOrder: 0,
      },
      {
        id: 2,
        imageUrl:
          'https://images.unsplash.com/photo-1485955900006-10f4d32477c2?auto=format&fit=crop&w=900&q=80',
        descriptionEs: 'Planta en maceta lista para su nuevo hogar.',
        descriptionEn: 'A potted plant ready for its new home.',
        sortOrder: 1,
      },
      {
        id: 3,
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
        descriptionEs: 'Jardín exterior con luz natural.',
        descriptionEn: 'An outdoor garden bathed in natural light.',
        sortOrder: 2,
      },
      {
        id: 4,
        imageUrl:
          'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
        descriptionEs: 'Detalle de hojas verdes y textura.',
        descriptionEn: 'A close look at green leaves and texture.',
        sortOrder: 3,
      },
    ];
  }

  private fallbackPlants(): Plant[] {
    return [
      {
        id: 1,
        slug: 'monstera-deliciosa',
        nameEs: 'Monstera deliciosa',
        nameEn: 'Swiss cheese plant',
        scientificName: 'Monstera deliciosa',
        descriptionEs: 'Icono tropical de hojas perforadas.',
        descriptionEn: 'Tropical icon with fenestrated leaves.',
        careEs: 'Riego moderado y luz filtrada.',
        careEn: 'Moderate water and filtered light.',
        lightEs: 'partial',
        lightEn: 'partial',
        waterEs: 'moderate',
        waterEn: 'moderate',
        humidityEs: 'high',
        humidityEn: 'high',
        imageUrl:
          'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        category: 'interior',
        price: 350,
        featured: true,
      },
      {
        id: 2,
        slug: 'sansevieria',
        nameEs: 'Sansevieria',
        nameEn: 'Snake plant',
        scientificName: 'Dracaena trifasciata',
        descriptionEs: 'Resistente y perfecta para principiantes.',
        descriptionEn: 'Hardy and perfect for beginners.',
        careEs: 'Poca agua y mucha paciencia.',
        careEn: 'Little water and lots of patience.',
        lightEs: 'shade',
        lightEn: 'shade',
        waterEs: 'low',
        waterEn: 'low',
        humidityEs: 'low',
        humidityEn: 'low',
        imageUrl:
          'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?auto=format&fit=crop&w=800&q=80',
        category: 'interior',
        price: 220,
        featured: true,
      },
      {
        id: 3,
        slug: 'calathea',
        nameEs: 'Calathea',
        nameEn: 'Calathea',
        scientificName: 'Calathea orbifolia',
        descriptionEs: 'Hojas pintadas que se pliegan al anochecer.',
        descriptionEn: 'Painted leaves that fold at night.',
        careEs: 'Humedad constante y riego suave.',
        careEn: 'Steady humidity and gentle watering.',
        lightEs: 'shade',
        lightEn: 'shade',
        waterEs: 'constant',
        waterEn: 'constant',
        humidityEs: 'high',
        humidityEn: 'high',
        imageUrl:
          'https://images.unsplash.com/photo-1597055181300-cb151fa61b4c?auto=format&fit=crop&w=800&q=80',
        category: 'interior',
        price: 280,
        featured: true,
      },
    ];
  }

  private fallbackPosts(): BlogPost[] {
    const base = [
      {
        slug: 'riego-sin-ahogar',
        titleEs: 'Riego sin ahogar',
        titleEn: 'Water without drowning',
        excerptEs: 'La regla del dedo y por qué menos suele ser más.',
        excerptEn: 'The finger rule and why less is often more.',
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'luz-correcta',
        titleEs: 'Encontrar la luz correcta',
        titleEn: 'Finding the right light',
        excerptEs: 'Directa, filtrada o sombra: cómo leer tu ventana.',
        excerptEn: 'Direct, filtered, or shade: how to read your window.',
        imageUrl:
          'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'hojas-amarillas',
        titleEs: 'Hojas amarillas: qué revisar primero',
        titleEn: 'Yellow leaves: what to check first',
        excerptEs: 'Un checklist corto antes de entrar en pánico.',
        excerptEn: 'A short checklist before you panic.',
        imageUrl:
          'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'trasplante-suave',
        titleEs: 'Trasplante sin estrés',
        titleEn: 'Gentle repotting',
        excerptEs: 'Cuándo cambiar de maceta y cómo no dañar raíces.',
        excerptEn: 'When to repot and how to protect the roots.',
        imageUrl:
          'https://images.unsplash.com/photo-1485955900006-10f4d32477c2?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'humedad-casa',
        titleEs: 'Humedad en casa seca',
        titleEn: 'Humidity in a dry home',
        excerptEs: 'Bandejas, agrupación y nebulizado con sentido.',
        excerptEn: 'Trays, grouping, and misting that actually help.',
        imageUrl:
          'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'plagas-comunes',
        titleEs: 'Plagas comunes al inicio',
        titleEn: 'Common early pests',
        excerptEs: 'Cochinilla, araña roja y qué hacer primero.',
        excerptEn: 'Mealybugs, spider mites, and first steps.',
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'fertilizante-basico',
        titleEs: 'Fertilizante sin exagerar',
        titleEn: 'Fertilizer without excess',
        excerptEs: 'Menos dosis, más constancia en temporada de crecimiento.',
        excerptEn: 'Lower dose, steadier rhythm in growing season.',
        imageUrl:
          'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
      },
      {
        slug: 'limpieza-hojas',
        titleEs: 'Hojas limpias, mejor fotosíntesis',
        titleEn: 'Clean leaves, better photosynthesis',
        excerptEs: 'Polvo, paño húmedo y cuándo usar jabón suave.',
        excerptEn: 'Dust, a damp cloth, and when mild soap helps.',
        imageUrl:
          'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
      },
    ];

    return base.map((post, index) => ({
      id: index + 1,
      slug: post.slug,
      titleEs: post.titleEs,
      titleEn: post.titleEn,
      excerptEs: post.excerptEs,
      excerptEn: post.excerptEn,
      contentEs: '',
      contentEn: '',
      imageUrl: post.imageUrl,
      published: true,
      createdAt: new Date().toISOString(),
    }));
  }
}
