import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

const guide = (slug, children) => ({ slug, items: children.map((c) => ({ slug: c })) });

export default defineConfig({
  site: 'https://openboxgl.github.io',
  output: 'static',
  integrations: [
    starlight({
      title: 'OpenBoxGL',
      favicon: '/favicon.svg',
      lastUpdated: true,
      pagination: true,
      customCss: ['./src/styles/openboxgl.css'],
      logo: { src: './src/assets/brand/openbox.svg', replacesTitle: false },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/OpenBoxGL/openboxgl.github.io' }],
      editLink: { baseUrl: 'https://github.com/OpenBoxGL/openboxgl.github.io/edit/main/' },
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://openboxgl.github.io/og-default.png' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'OpenBox Game Launcher for Linux' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://openboxgl.github.io/og-default.png' } },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { slug: 'index' },
            { slug: 'install' },
            { slug: 'getting-started' },
            { slug: 'interfaces-and-data' },
            { slug: 'updating' },
          ],
        },
        {
          label: 'Use OpenBox',
          collapsed: true,
          items: [
            {
              label: 'Library and imports',
              collapsed: true,
              items: [
                { slug: 'guides/library' },
                { slug: 'guides/library/importing' },
                { slug: 'guides/library/organizing' },
                { slug: 'guides/library/queue-tags-notifications' },
                { slug: 'guides/metadata-and-media' },
                { slug: 'guides/media-providers' },
                { slug: 'guides/storefront-manager' },
                { slug: 'guides/discovery' },
              ],
            },
            {
              label: 'Launch and fullscreen',
              collapsed: true,
              items: [
                { slug: 'guides/emulators-and-launching' },
                { slug: 'guides/big-box-and-handhelds' },
                { slug: 'guides/big-box-and-handhelds/performance' },
                { slug: 'guides/retroachievements' },
                { slug: 'themes' },
              ],
            },
            {
              label: 'Saves and recovery',
              collapsed: true,
              items: [
                { slug: 'guides/sessions-saves-and-backups' },
                { slug: 'guides/sessions-saves-and-backups/saves' },
                { slug: 'guides/sessions-saves-and-backups/library-backups' },
                { slug: 'guides/sessions-saves-and-backups/statistics-sync' },
              ],
            },
            {
              label: 'Extend and automate',
              collapsed: true,
              items: [
                { slug: 'guides/plugins' },
                { slug: 'guides/troubleshooting' },
                { slug: 'guides/troubleshooting/startup-and-browser' },
                { slug: 'guides/troubleshooting/imports' },
                { slug: 'guides/troubleshooting/metadata-and-media' },
                { slug: 'guides/troubleshooting/launching' },
                { slug: 'guides/troubleshooting/state-recovery' },
                { slug: 'guides/troubleshooting/backups-and-restores' },
                { slug: 'guides/troubleshooting/integration-credentials' },
                { slug: 'guides/troubleshooting/plugins' },
                { slug: 'guides/troubleshooting/diagnostic-logs' },
              ],
            },
          ],
        },
        {
          label: 'Integrations',
          collapsed: true,
          items: [
            { slug: 'integrations/import-sources' },
            { slug: 'integrations/accounts-and-media' },
            { slug: 'integrations/local-services' },
            { slug: 'integrations/webhooks' },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            { slug: 'reference/configuration' },
            { slug: 'reference/command-tokens' },
            { slug: 'reference/search-syntax' },
            { slug: 'reference/data-and-recovery' },
            { slug: 'reference/save-archives' },
            { slug: 'reference/library-backups' },
            { slug: 'reference/background-jobs' },
            {
              label: 'REST API',
              collapsed: true,
              items: [
                { slug: 'reference/api' },
                { slug: 'reference/api/overview' },
                { slug: 'reference/api/library-and-settings' },
                { slug: 'reference/api/automation' },
                { slug: 'reference/api/content-and-imports' },
                { slug: 'reference/api/saves-and-operations' },
                { slug: 'reference/api/local-admin' },
              ],
            },
            {
              label: 'Plugins',
              collapsed: true,
              items: [
                { slug: 'reference/plugins' },
                { slug: 'reference/plugins/overview' },
                { slug: 'reference/plugins/manifest' },
                { slug: 'reference/plugins/hooks' },
                { slug: 'reference/plugins/process-and-errors' },
                { slug: 'reference/plugins/catalog' },
              ],
            },
            { slug: 'reference/parity' },
          ],
        },
        {
          label: 'Project and policies',
          collapsed: true,
          items: [
            { slug: 'project/contributing' },
            { slug: 'project/design-system' },
            { slug: 'policies/security' },
            { slug: 'policies/legal-and-trademarks' },
          ],
        },
      ],
    }),
    mdx(),
  ],
  redirects: {
    '/library': '/guides/library',
    '/importing': '/guides/library/importing',
    '/organizing': '/guides/library/organizing',
    '/queue-tags-notifications': '/guides/library/queue-tags-notifications',
    '/metadata-and-media': '/guides/metadata-and-media',
    '/emulators-and-launching': '/guides/emulators-and-launching',
    '/big-box-and-handhelds': '/guides/big-box-and-handhelds',
    '/handheld-performance': '/guides/big-box-and-handhelds/performance',
    '/sessions-saves-and-backups': '/guides/sessions-saves-and-backups',
    '/troubleshooting': '/guides/troubleshooting',
    '/retroachievements': '/guides/retroachievements',
    '/plugins': '/guides/plugins',
    '/discovery': '/guides/discovery',
    '/storefront-manager': '/guides/storefront-manager',
    '/media-providers': '/guides/media-providers',
    '/search-syntax': '/reference/search-syntax',
  },
});
