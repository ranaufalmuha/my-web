import type { MetadataRoute } from 'next'

const SITE_URL = 'https://ranaufalmuha.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getBasicSitemap()
}

function getBasicSitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
  ]
}
