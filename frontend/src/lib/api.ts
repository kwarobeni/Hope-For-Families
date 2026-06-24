const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api';

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface Initiative {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  image: string | null;
}

export interface Program {
  id: number;
  initiative_id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  published_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_at: string;
  end_at: string | null;
  location: string;
  capacity: number | null;
  image: string | null;
  registration_open: number;
}

export interface Testimonial {
  id: number;
  name: string;
  category: string;
  content: string;
  image: string | null;
  is_featured: number;
}

export interface ImpactStat {
  id: number;
  label: string;
  value: number;
}

export interface Resource {
  id: number;
  title: string;
  file_url: string;
  category: string;
}

export const api = {
  initiatives: () => getJson<Initiative[]>('/initiatives').then((r) => r ?? []),
  initiativeBySlug: (slug: string) => getJson<Initiative & { programs: Program[] }>(`/initiatives/${slug}/full`),
  posts: () => getJson<BlogPost[]>('/posts').then((r) => r ?? []),
  postBySlug: (slug: string) => getJson<BlogPost>(`/posts/${slug}`),
  events: () => getJson<EventItem[]>('/events').then((r) => r ?? []),
  eventBySlug: (slug: string) => getJson<EventItem & { photos: { id: number; image: string; caption: string }[]; registration_count: number }>(`/events/${slug}`),
  testimonials: () => getJson<Testimonial[]>('/testimonials').then((r) => r ?? []),
  impactStats: () => getJson<ImpactStat[]>('/impact-stats').then((r) => r ?? []),
  resources: () => getJson<Resource[]>('/resources').then((r) => r ?? []),
  settings: () => getJson<Record<string, string>>('/settings').then((r) => r ?? {}),
};

export { API_URL };
