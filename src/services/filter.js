// src/services/filter.js

export function isValidLead(text) {
  const t = text.toLowerCase();

  // Negative keywords - exclude news, blogs, articles, tutorials
  const negativeKeywords = [
    'news', 'blog', 'article', 'tutorial', 'guide', 'how to', 'announcement',
    'update', 'release', 'launch', 'feature', 'comparison', 'review', 'analysis',
    'market', 'industry', 'trend', 'report', 'study', 'research', 'survey',
    'interview', 'podcast', 'video', 'youtube', 'course', 'training', 'education',
    'every', 'should know', 'best', 'top', 'killing', 'cracks down', 'unveils',
    'shifts', 'plans', 'marks', 'boosts', 'cutting', 'risk', 'boom', 'about',
    'kills', 'increasing', 'program', 'apprentices'
  ];

  // Negative patterns - check for news/blog indicators
  const negativePatterns = [
    /\d+\s+best/i,           // "10 best", "5 best", etc.
    /\d+\s+top/i,            // "10 top", "5 top", etc.
    /every\s+\w+\s+should/i,  // "every developer should"
    /is\s+killing/i,         // "is killing"
    /cracks\s+down/i,        // "cracks down"
    /unveils/i,              // "unveils"
    /shifts\s+toward/i,      // "shifts toward"
    /\d+\s+release/i,        // "2026 release"
    /marks\s+\d+/i,          // "marks 200"
    /boosts\s+productivity/i, // "boosts productivity"
    /cutting\s+budgets/i,    // "cutting budgets"
  ];

  // Check for negative keywords first
  for (let keyword of negativeKeywords) {
    if (t.includes(keyword)) {
      return false;
    }
  }

  // Check for negative patterns
  for (let pattern of negativePatterns) {
    if (pattern.test(t)) {
      return false;
    }
  }

  // Positive indicators of client needs
  const clientNeedKeywords = [
    'need', 'looking for', 'hire', 'seeking', 'want', 'require', 'searching for',
    'wanted', 'required', 'urgently need', 'immediate need'
  ];

  // Software project keywords
  const softwareKeywords = [
    'website', 'app', 'application', 'software', 'developer', 'programmer',
    'web development', 'mobile app', 'frontend', 'backend', 'full stack',
    'react', 'nodejs', 'python', 'javascript', 'php', 'laravel', 'wordpress',
    'ecommerce', 'api', 'database', 'ui/ux', 'design', 'coding', 'programming'
  ];

  const hasClientNeed = clientNeedKeywords.some(keyword => t.includes(keyword));
  const hasSoftwareKeyword = softwareKeywords.some(keyword => t.includes(keyword));

  return hasClientNeed && hasSoftwareKeyword;
}