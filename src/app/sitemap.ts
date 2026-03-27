import { MetadataRoute } from 'next'
import { slugify } from '@/lib/utils'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dinletiyo.com';
  const lastModified = new Date();

  // Ana sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gizlilik`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/kosullar`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/destek`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/market`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/katil`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Popüler Playlistler
  const playlistIds = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
  const playlistPages: MetadataRoute.Sitemap = playlistIds.map(id => ({
    url: `${baseUrl}/home/playlist/${id}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Popüler Sanatçılar
  const popularArtists = [
    'BLOK3', 'Ati242', 'Semicenk', 'Era7capone', 'Lvbel C5', 'Uzi', 'Sezen Aksu',
    'Motive', 'Gülşen', 'Yalın', 'Dedublüman', 'Hande Yener', 'Ebru Gündes',
    'Ezhel', 'Simge', 'Sertab Erener', 'Ceza', 'Şehinşah', 'Khontkar', 'Sagopa Kajmer',
    'Tarkan', 'Mabel Matiz', 'Aleyna Tilki', 'Zeynep Bastık', 'Hadise', 'Sıla'
  ];
  const artistPages: MetadataRoute.Sitemap = popularArtists.map(name => ({
    url: `${baseUrl}/home/artist/${slugify(name)}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...playlistPages, ...artistPages];
}

