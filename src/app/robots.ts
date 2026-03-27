import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dev/',
        '/api/',
        '/home/settings',
        '/home/profile',
        '/home/library',
        '/admin/',
        '/yonetim/',
      ],
    },
    sitemap: 'https://dinletiyo.com/sitemap.xml',
  }
}
