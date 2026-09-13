export const APPIMAGE_ARCHITECTURES = ["x86_64", "aarch64"]

const ARCHITECTURE_ALIASES = new Map([
  ["x86_64", "x86_64"],
  ["amd64", "x86_64"],
  ["x64", "x86_64"],
  ["aarch64", "aarch64"],
  ["arm64", "aarch64"],
])

export function normalizeArchitecture(value) {
  const key = String(value ?? "").trim().toLowerCase()
  return ARCHITECTURE_ALIASES.get(key) || null
}

export function appimageAssetName(architecture) {
  const normalized = normalizeArchitecture(architecture)
  return normalized ? `OpenBox-${normalized}.AppImage` : null
}

function findAsset(release, name) {
  return release?.assets?.find((asset) => asset.name === name) || null
}

function appimageInfo(release, architecture) {
  const name = appimageAssetName(architecture)
  const appimage = findAsset(release, name)
  const checksum = findAsset(release, `${name}.sha256`)
  return appimage
    ? {
        url: appimage.browser_download_url,
        size: appimage.size,
        downloads: appimage.download_count,
        checksum_url: checksum?.browser_download_url || null,
      }
    : null
}

/**
 * Return each AppImage together with the checksum belonging to that exact
 * architecture. This deliberately never consults the server's host arch.
 */
export function releaseAppimageAssets(release) {
  return Object.fromEntries(
    APPIMAGE_ARCHITECTURES.map((architecture) => [architecture, appimageInfo(release, architecture)]),
  )
}
