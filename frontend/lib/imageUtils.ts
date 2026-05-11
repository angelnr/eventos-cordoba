function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  if (hostname === 'eventoscordoba.xyz') {
    return 'https://api.eventoscordoba.xyz';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'https://api.eventoscordoba.xyz';
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