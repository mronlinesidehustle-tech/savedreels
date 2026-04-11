// Detects platform and extracts video ID + thumbnail from URL.

export function detectPlatform(url) {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.includes('tiktok.com'))    return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('twitter.com') || u.includes('x.com'))   return 'twitter';
  if (u.includes('twitch.tv'))     return 'twitch';
  if (u.includes('pinterest.com')) return 'pinterest';
  return 'other';
}

export function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,16})/,
    /youtu\.be\/([a-zA-Z0-9_-]{6,16})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,16})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,16})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId) {
  // Validate ID is safe before embedding in URL
  if (!videoId || !/^[a-zA-Z0-9_-]{6,16}$/.test(videoId)) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getPlatformColor(platform) {
  const colors = {
    tiktok:    { bg: '#010101', text: '#ffffff', label: 'TikTok'    },
    instagram: { bg: '#E1306C', text: '#ffffff', label: 'Instagram' },
    youtube:   { bg: '#FF0000', text: '#ffffff', label: 'YouTube'   },
    twitter:   { bg: '#1DA1F2', text: '#ffffff', label: 'X / Twitter' },
    twitch:    { bg: '#9147FF', text: '#ffffff', label: 'Twitch'    },
    pinterest: { bg: '#E60023', text: '#ffffff', label: 'Pinterest' },
    other:     { bg: '#4A4560', text: '#ffffff', label: 'Link'      },
  };
  return colors[platform] || colors.other;
}

export function parseVideoUrl(rawUrl) {
  let url = rawUrl.trim();
  if (!url) return null;
  if (!url.startsWith('http')) url = 'https://' + url;

  const platform  = detectPlatform(url);
  let   thumbnail = null;
  let   title     = null;

  if (platform === 'youtube') {
    const ytId = extractYouTubeId(url);
    if (ytId) thumbnail = getYouTubeThumbnail(ytId);
  }

  return { url, platform, thumbnail, title };
}

export function isValidUrl(url) {
  try {
    const u = url.trim();
    const full = u.startsWith('http') ? u : 'https://' + u;
    const parsed = new URL(full);
    // Whitelist safe protocols only — block javascript:, data:, blob: etc.
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

// Sanitize URL before rendering as href — prevents javascript: XSS
export function safeHref(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#';
    return parsed.href;
  } catch {
    return '#';
  }
}
