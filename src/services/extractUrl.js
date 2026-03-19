// src/services/extractUrl.js
export function extractRealUrl(googleUrl) {
  try {
    const url = new URL(googleUrl);
    return url.searchParams.get('url') || googleUrl;
  } catch {
    return googleUrl;
  }
}