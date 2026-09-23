import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FOSS Club - Government College of Engineering, Erode',
    short_name: 'FOSSGCEE',
    description:
      'Free and Open Source Software Club at Government College of Engineering, Erode. Promoting Linux, open-source culture, and real-world contributions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/foss_gcee_logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
