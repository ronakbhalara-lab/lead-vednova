// src/services/detectPlatform.js
export function detectPlatform(url) {
  if (url.includes('upwork')) return 'Upwork';
  if (url.includes('freelancer')) return 'Freelancer';
  if (url.includes('peopleperhour')) return 'PeoplePerHour';
  return 'Other';
}