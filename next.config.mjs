/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    { source: '/library', destination: '/guides/library', permanent: true },
    { source: '/importing', destination: '/guides/library/importing', permanent: true },
    { source: '/organizing', destination: '/guides/library/organizing', permanent: true },
    { source: '/queue-tags-notifications', destination: '/guides/library/queue-tags-notifications', permanent: true },
    { source: '/metadata-and-media', destination: '/guides/metadata-and-media', permanent: true },
    { source: '/emulators-and-launching', destination: '/guides/emulators-and-launching', permanent: true },
    { source: '/big-box-and-handhelds', destination: '/guides/big-box-and-handhelds', permanent: true },
    { source: '/handheld-performance', destination: '/guides/big-box-and-handhelds/performance', permanent: true },
    { source: '/sessions-saves-and-backups', destination: '/guides/sessions-saves-and-backups', permanent: true },
    { source: '/troubleshooting', destination: '/guides/troubleshooting', permanent: true },
    { source: '/retroachievements', destination: '/guides/retroachievements', permanent: true },
    { source: '/plugins', destination: '/guides/plugins', permanent: true },
    { source: '/discovery', destination: '/guides/discovery', permanent: true },
    { source: '/storefront-manager', destination: '/guides/storefront-manager', permanent: true },
    { source: '/media-providers', destination: '/guides/media-providers', permanent: true },
    { source: '/search-syntax', destination: '/reference/search-syntax', permanent: true },
  ],
}

export default nextConfig
