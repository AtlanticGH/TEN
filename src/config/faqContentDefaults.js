export const CONTACT_FAQ_KEY = 'contact.faq.v1'
export const RESOURCES_FAQ_KEY = 'resources.faq.v1'

export const DEFAULT_CONTACT_FAQ = {
  eyebrow: 'FAQs',
  title: 'Quick answers',
  items: [
    {
      q: 'How soon will I hear back?',
      a: 'We typically reply within 24–48 hours.',
    },
    {
      q: 'What should I include in my message?',
      a: 'Share your current stage, what you’re building, and the kind of support you’re looking for (membership, mentorship, or partnerships).',
    },
    {
      q: 'Is this for beginners?',
      a: 'Yes. TEN supports idea-stage founders and early-stage entrepreneurs through structured mentorship and community accountability.',
    },
  ],
}

export const DEFAULT_RESOURCES_FAQ = {
  eyebrow: 'FAQs',
  title: 'Common questions',
  items: [
    {
      q: 'How often do mentorship sessions happen?',
      a: 'Most members have weekly accountability check-ins and monthly deep-dive mentor sessions.',
    },
    {
      q: 'Can beginners join TEN?',
      a: 'Yes. TEN supports both idea-stage founders and early-stage entrepreneurs with structured pathways.',
    },
    {
      q: 'Where should I start?',
      a: 'Start from the Join page application. We review your stage and recommend your first mentorship track.',
    },
  ],
}

export function normalizeFaqItems(items) {
  return (items || [])
    .map((item) => ({
      q: String(item?.q || item?.question || '').trim(),
      a: String(item?.a || item?.answer || '').trim(),
    }))
    .filter((item) => item.q || item.a)
}

export function mergeFaqContent(defaults, override) {
  if (!override || typeof override !== 'object') return { ...defaults, items: [...defaults.items] }
  return {
    eyebrow: override.eyebrow ?? defaults.eyebrow,
    title: override.title ?? defaults.title,
    items: normalizeFaqItems(override.items).length ? normalizeFaqItems(override.items) : [...defaults.items],
  }
}
