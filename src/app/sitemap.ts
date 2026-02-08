export default function sitemap() {
  const lastModified = new Date().toISOString()

  return [
    {
      url: 'https://dinletiyo.com',
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dinletiyo.com/login',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dinletiyo.com/signup',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dinletiyo.com/gizlilik',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://dinletiyo.com/kosullar',
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://dinletiyo.com/destek',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://dinletiyo.com/market',
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://dinletiyo.com/katil',
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
