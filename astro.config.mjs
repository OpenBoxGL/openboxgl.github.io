import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://openboxgl.github.io',
  output: 'static',
  integrations: [starlight({
    title: 'OpenBoxGL',
    favicon: '/favicon.svg',
    lastUpdated: true,
    pagination: true,
    customCss: ['./src/styles/openboxgl.css'],
    logo: { src: './src/assets/brand/openbox.svg', replacesTitle: false },
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/OpenBoxGL/openboxgl.github.io' }],
    editLink: { baseUrl: 'https://github.com/OpenBoxGL/openboxgl.github.io/edit/main/' },
    sidebar: [
      { label: 'Start here', items: [
        { slug: 'index' }, { slug: 'install' }, { slug: 'getting-started' },
        { slug: 'interfaces-and-data' }, { slug: 'updating' }
      ] },
      { label: 'Use OpenBoxGL', items: [
        { slug: 'library' }, { slug: 'importing' }, { slug: 'organizing' },
        { slug: 'queue-tags-notifications' }, { slug: 'metadata-and-media' },
        { slug: 'emulators-and-launching' }, { slug: 'big-box-and-handhelds' },
        { slug: 'handheld-performance' }, { slug: 'sessions-saves-and-backups' },
        { slug: 'themes' }, { slug: 'troubleshooting' }
      ] },
      { label: 'Integrations', items: [
        { slug: 'integrations/import-sources' }, { slug: 'integrations/accounts-and-media' },
        { slug: 'integrations/local-services' }, { slug: 'integrations/webhooks' }
      ] },
      { label: 'Reference', items: [
        { slug: 'reference/configuration' }, { slug: 'reference/command-tokens' },
        { slug: 'reference/data-and-recovery' }, { slug: 'reference/api' },
        { slug: 'reference/plugins' }, { slug: 'reference/parity' }
      ] },
      { label: 'Project', items: [
        { slug: 'project/contributing' }, { slug: 'project/design-system' },
        { slug: 'policies/security' }, { slug: 'policies/legal-and-trademarks' }
      ] }
    ]
  })]
});
