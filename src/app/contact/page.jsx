// app/contact/page.jsx
export const metadata = {
  title: "Contact — Anonymotion",
  description: "Have feedback or questions? Get in touch with us.",
  alternates: { canonical: "/contact" },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — Anonymotion",
    url: "/contact",
    contactPoint: [{
      "@type": "ContactPoint",
      email: "anonimotions.team@gmail.com",
      contactType: "customer support",
      availableLanguage: ["en"],
      areaServed: "Worldwide"
    }]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
        <div className="glow-lamp pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10">
          <header className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-inverted">
              Contact
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
              Have questions, feedback, or found a bug? We’d love to hear from you.
            </p>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
              <div className="text-xs text-white/60">Email address</div>
              <a
                href="mailto:anonimotions.team@gmail.com"
                className="mt-1 block text-lg font-medium text-white underline-offset-4 hover:underline"
              >
                anonimotions.team@gmail.com
              </a>
              <p className="mt-2 text-xs text-white/60">
                We usually respond within 1–2 business days.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
              <div className="text-xs text-white/60">When to contact us</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-white/85 space-y-1.5">
                <li>Issues with signing in or verifying your email</li>
                <li>Bug reports or feature suggestions</li>
                <li>Privacy or data-related inquiries</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/70">
            <a href="/legal/privacy" className="underline hover:text-white">Privacy Policy</a>
            <span aria-hidden>•</span>
            <a href="/legal/terms" className="underline hover:text-white">Terms of Service</a>
          </div>
        </div>
      </section>

      <JsonLd />
    </main>
  );
}
