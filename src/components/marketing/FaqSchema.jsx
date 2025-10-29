// src/components/marketing/FaqSchema.jsx
// Server Component — injectează FAQPage JSON-LD pe baza întrebărilor tale
export default function FaqSchema({ items }) {
  if (!items?.length) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  return (
    <script
      type="application/ld+json"
      // stringify fără spații: payload mic
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
