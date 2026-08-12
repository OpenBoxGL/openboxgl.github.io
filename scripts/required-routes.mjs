// All routes that must exist in the static export.
// Root pages that had guide duplicates now live at their guide slug
// (redirects in next.config.mjs cover the old root URLs).
export const requiredRoutes = [
  '/', '/install/', '/getting-started/', '/interfaces-and-data/', '/updating/',
  '/themes/',
  '/integrations/import-sources/', '/integrations/accounts-and-media/', '/integrations/local-services/', '/integrations/webhooks/',
  '/guides/library/', '/guides/library/importing/', '/guides/library/organizing/', '/guides/library/queue-tags-notifications/', '/guides/metadata-and-media/', '/guides/emulators-and-launching/', '/guides/big-box-and-handhelds/', '/guides/big-box-and-handhelds/performance/', '/guides/sessions-saves-and-backups/', '/guides/sessions-saves-and-backups/saves/', '/guides/sessions-saves-and-backups/library-backups/', '/guides/sessions-saves-and-backups/statistics-sync/', '/guides/troubleshooting/', '/guides/troubleshooting/startup-and-browser/', '/guides/troubleshooting/imports/', '/guides/troubleshooting/metadata-and-media/', '/guides/troubleshooting/launching/', '/guides/troubleshooting/state-recovery/', '/guides/troubleshooting/backups-and-restores/', '/guides/troubleshooting/integration-credentials/', '/guides/troubleshooting/plugins/', '/guides/troubleshooting/diagnostic-logs/', '/guides/retroachievements/', '/guides/plugins/', '/guides/discovery/', '/guides/storefront-manager/', '/guides/media-providers/', '/reference/search-syntax/', '/reference/save-archives/', '/reference/library-backups/', '/reference/background-jobs/', '/reference/api/overview/', '/reference/api/library-and-settings/', '/reference/api/automation/', '/reference/api/content-and-imports/', '/reference/api/saves-and-operations/', '/reference/api/local-admin/', '/reference/plugins/overview/', '/reference/plugins/manifest/', '/reference/plugins/hooks/', '/reference/plugins/process-and-errors/', '/reference/plugins/catalog/',
  '/reference/configuration/', '/reference/command-tokens/', '/reference/data-and-recovery/', '/reference/how-it-works/', '/reference/api/', '/reference/plugins/', '/reference/parity/',
  '/project/contributing/', '/project/design-system/', '/policies/security/', '/policies/legal-and-trademarks/',
  '/search/'
];
