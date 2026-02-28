// Utility: resolves image URLs and provides fallback handling when an image fails to load.

import { API_ORIGIN } from '../api/client';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

function mapGoogleDriveUrl(value) {
  const match = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (!match) return null;
  return `https://drive.google.com/uc?export=view&id=${match[1]}`;
}

function mapDropboxUrl(value) {
  try {
    const url = new URL(value);
    if (!url.hostname.includes('dropbox.com')) return null;
    url.hostname = 'dl.dropboxusercontent.com';
    url.searchParams.delete('dl');
    return url.toString();
  } catch {
    return null;
  }
}

export function resolveImageUrl(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return PLACEHOLDER_IMAGE;

  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('/uploads/')) return `${API_ORIGIN}${value}`;
  if (value.startsWith('/')) return value;
  if (value.startsWith('//')) return `https:${value}`;

  const driveUrl = mapGoogleDriveUrl(value);
  if (driveUrl) return driveUrl;

  const dropboxUrl = mapDropboxUrl(value);
  if (dropboxUrl) return dropboxUrl;

  try {
    return new URL(value).toString();
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}

export function handleImageError(event) {
  const img = event.currentTarget;
  img.onerror = null;
  img.src = PLACEHOLDER_IMAGE;
}


