import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dev/', '/api/', '/home/'],
    },
    sitemap: 'https://dinletiyo.com/sitemap.xml',
  }
}