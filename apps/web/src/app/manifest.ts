import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkillMango AI',
    short_name: 'SkillMango',
    description: 'Launch your courses, communities, and workshops with AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060A16',
    theme_color: '#FF9F1C',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
