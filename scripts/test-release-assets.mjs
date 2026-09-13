import assert from 'node:assert/strict'
import { appimageAssetName, normalizeArchitecture, releaseAppimageAssets } from '../server/release-assets.mjs'

assert.equal(normalizeArchitecture('x86_64'), 'x86_64')
assert.equal(normalizeArchitecture('amd64'), 'x86_64')
assert.equal(normalizeArchitecture('arm64'), 'aarch64')
assert.equal(normalizeArchitecture('sparc64'), null)
assert.equal(appimageAssetName('x64'), 'OpenBox-x86_64.AppImage')

const release = {
  assets: [
    { name: 'OpenBox-x86_64.AppImage', browser_download_url: 'https://example.test/x86', size: 10, download_count: 1 },
    { name: 'OpenBox-x86_64.AppImage.sha256', browser_download_url: 'https://example.test/x86.sha256' },
    { name: 'OpenBox-aarch64.AppImage', browser_download_url: 'https://example.test/arm', size: 20, download_count: 2 },
    { name: 'OpenBox-aarch64.AppImage.sha256', browser_download_url: 'https://example.test/arm.sha256' },
  ],
}
const assets = releaseAppimageAssets(release)
assert.equal(assets.x86_64.url, 'https://example.test/x86')
assert.equal(assets.x86_64.checksum_url, 'https://example.test/x86.sha256')
assert.equal(assets.aarch64.url, 'https://example.test/arm')
assert.equal(assets.aarch64.checksum_url, 'https://example.test/arm.sha256')
assert.notEqual(assets.x86_64.checksum_url, assets.aarch64.checksum_url)

console.log('release asset architecture/checksum pairing passed')
