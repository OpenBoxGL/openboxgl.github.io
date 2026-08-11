import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const guideGroup = (label, slug, children) => ({ label, items: [{ slug }, ...children.map((child) => ({ slug: `${slug}/${child}` }))] });
const refGroup = (label, slug, children, childBase = slug) => ({ label, items: [{ slug }, ...children.map((child) => ({ slug: `${childBase}/${child}` }))] });

export default defineConfig({
  site: 'https://openboxgl.github.io', output: 'static',
  integrations: [starlight({
    title: 'OpenBoxGL', favicon: '/favicon.svg', lastUpdated: true, pagination: true,
    customCss: ['./src/styles/openboxgl.css'],
    logo: { src: './src/assets/brand/openbox.svg', replacesTitle: false },
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/OpenBoxGL/openboxgl.github.io' }],
    editLink: { baseUrl: 'https://github.com/OpenBoxGL/openboxgl.github.io/edit/main/' },
    sidebar: [
      { label: 'Start here', items: [{ slug: 'index' }, { slug: 'install' }, { slug: 'getting-started' }, { slug: 'interfaces-and-data' }, { slug: 'updating' }] },
      { label: 'Use OpenBoxGL', items: [
        guideGroup('Library overview', 'guides/library', ['importing', 'organizing', 'queue-tags-notifications']),
        { slug: 'guides/metadata-and-media' }, { slug: 'guides/emulators-and-launching' },
        guideGroup('Big Box and handhelds', 'guides/big-box-and-handhelds', ['performance']),
        guideGroup('Sessions, saves, and backups', 'guides/sessions-saves-and-backups', ['saves', 'library-backups', 'statistics-sync']),
        { slug: 'themes' }, guideGroup('Troubleshooting', 'guides/troubleshooting', ['startup-and-browser', 'imports', 'metadata-and-media', 'launching', 'state-recovery', 'backups-and-restores', 'integration-credentials', 'plugins', 'diagnostic-logs'])
      ] },
      { label: 'Integrations', items: [{ slug: 'integrations/import-sources' }, { slug: 'integrations/accounts-and-media' }, { slug: 'integrations/local-services' }, { slug: 'integrations/webhooks' }] },
      { label: 'Reference', items: [
        { slug: 'reference/configuration' }, { slug: 'reference/command-tokens' }, { slug: 'reference/data-and-recovery' }, { slug: 'reference/save-archives' }, { slug: 'reference/library-backups' }, { slug: 'reference/background-jobs' },
        refGroup('REST API', 'reference/api/overview', ['library-and-settings', 'automation', 'content-and-imports', 'saves-and-operations', 'local-admin'], 'reference/api'),
        refGroup('Plugins', 'reference/plugins/overview', ['manifest', 'hooks', 'process-and-errors', 'catalog'], 'reference/plugins'), { slug: 'reference/parity' }
      ] },
      { label: 'Project and policies', items: [{ slug: 'project/contributing' }, { slug: 'project/design-system' }, { slug: 'policies/security' }, { slug: 'policies/legal-and-trademarks' }] }
    ]
  })]
});
