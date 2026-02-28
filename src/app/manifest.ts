import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ร้านอาหาร POS',
    short_name: 'POS',
    description: 'ระบบจัดการร้านอาหาร',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f0eb',
    theme_color: '#FA3E3E',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-152.png',
        sizes: '152x152',
        type: 'image/png',
      },
    ],
  }
}
