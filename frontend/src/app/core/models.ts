export type Lang = 'es' | 'en';

export interface Plant {
  id: number;
  slug: string;
  nameEs: string;
  nameEn: string;
  scientificName: string;
  descriptionEs: string;
  descriptionEn: string;
  careEs: string;
  careEn: string;
  lightEs: string;
  lightEn: string;
  waterEs: string;
  waterEn: string;
  humidityEs: string;
  humidityEn: string;
  imageUrl: string;
  category: string;
  price: number | null;
  featured: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  contentEs: string;
  contentEn: string;
  imageUrl: string;
  published: boolean;
  createdAt: string;
}

export interface Appointment {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  plantIssue: string;
  preferredDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentDto {
  customerName: string;
  email: string;
  phone: string;
  plantIssue: string;
  preferredDate: string;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  descriptionEs: string;
  descriptionEn: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  plantId: number;
  slug: string;
  nameEs: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

