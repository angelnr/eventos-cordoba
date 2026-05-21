function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  if (hostname === 'eventoscordoba.xyz') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://eventoscordoba.xyz';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'https://eventoscordoba.xyz';
}

export function getAvatarUrl(avatarUrl: string | null | undefined, version?: number): string | null {
  const url = getImageUrl(avatarUrl);
  if (!url) return null;
  if (version) return `${url}?v=${version}`;
  return url;
}

export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}${imageUrl}`;
}

export function getContrastColor(hex: string): string {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}