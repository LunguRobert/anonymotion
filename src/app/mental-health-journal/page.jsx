export const metadata = {
  title: "Mental Health Journal App – Write, Reflect, and Heal Privately | Anonymotions",
  description:
    "Improve your mental wellbeing with a private, anonymous mental health journal app. Write your thoughts freely, track your emotions, and build emotional resilience.",
  alternates: {
    canonical: "https://www.anonymotions.com/mental-health-journal",
  },
  openGraph: {
    title: "Anonymous Mental Health Journal App – Reflect & Heal | Anonymotions",
    description:
      "A safe, anonymous mental health journaling app to express your emotions, reduce anxiety, and understand your mind better.",
    url: "https://www.anonymotions.com/mental-health-journal",
    siteName: "Anonymotions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mental Health Journal App – Private & Anonymous | Anonymotions",
    description:
      "A secure digital space for mental wellbeing. Write about your thoughts privately and track emotional patterns without revealing your identity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MentalHealthJournalPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* HERO */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-inverted sm:text-5xl">
          Mental Health Journal App
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          A safe, anonymous mental health journal designed to help you reduce
          anxiety, process emotions, and understand your mind — without sharing personal data.
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href="/auth/register"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow hover:bg-primary/90"
          >
            Start Journaling for Your Wellbeing
          </a>
        </div>
      </section>

      {/* Why journaling helps mental health */}
      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-inverted">
          Why journaling improves mental health
        </h2>
        <p className="mt-4 text-muted leading-relaxed">
          Mental health journaling is a powerful method for understanding your emotions,
          reducing stress, and improving self-awareness. Writing about your experiences
          can help you process overwhelming thoughts, challenge negative patterns, and
          gain clarity in moments of confusion.
        </p>

        <ul className="mt-6 space-y-3 text-muted">
          <li>• Reduce symptoms of anxiety and emotional overload</li>
          <li>• Improve clarity and emotional regulation</li>
          <li>• Identify mental health triggers and patterns</li>
          <li>• Strengthen self-awareness and resilience</li>
          <li>• Build a routine of self-care and reflection</li>
        </ul>
      </section>

      {/* What makes Anonymotions ideal for mental health journaling */}
      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-inverted">
          What makes Anonymotions the best mental health journal?
        </h2>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-secondary bg-card/60 p-6">
            <h3 className="text-lg font-semibold text-inverted">Completely Anonymous</h3>
            <p className="mt-2 text-muted leading-relaxed">
              No real name. No identity. No social profile.  
              You can express emotions with total freedom and zero pressure.
            </p>
          </div>

          <div className="rounded-2xl border border-secondary bg-card/60 p-6">
            <h3 className="text-lg font-semibold text-inverted">
              Safe for Emotional Vulnerability
            </h3>
            <p className="mt-2 text-muted leading-relaxed">
              A private space designed for honesty. No public posts, no comments,
              no judgment — only you and your feelings.
            </p>
          </div>

          <div className="rounded-2xl border border-secondary bg-card/60 p-6">
            <h3 className="text-lg font-semibold text-inverted">Mood Tracking Insights</h3>
            <p className="mt-2 text-muted leading-relaxed">
              Track your emotional trends over time to better understand your mental wellbeing.
            </p>
          </div>

          <div className="rounded-2xl border border-secondary bg-card/60 p-6">
            <h3 className="text-lg font-semibold text-inverted">
              Encrypted & Secure
            </h3>
            <p className="mt-2 text-muted leading-relaxed">
              Entries are stored securely and privately. Your writing belongs only to you.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-20">
        <h2 className="text-2xl font-semibold text-inverted">How it works</h2>

        <ol className="mt-6 space-y-4 text-muted leading-relaxed">
          <li>
            <strong className="text-inverted">1. Create a free account</strong><br />
            No personal information required — just an email for login security.
          </li>

          <li>
            <strong className="text-inverted">2. Write your thoughts daily</strong><br />
            Use the emotional journal to express how you feel and why.
          </li>

          <li>
            <strong className="text-inverted">3. Track your emotional patterns</strong><br />
            See how your mood evolves over time and what impacts your wellbeing.
          </li>

          <li>
            <strong className="text-inverted">4. Build a healthier mindset</strong><br />
            Through reflection, emotional clarity gradually becomes easier.
          </li>
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold text-inverted">
          Begin your mental wellbeing journey today
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Your thoughts deserve a safe place — one that protects your privacy while helping
          you grow emotionally.
        </p>

        <a
          href="/auth/register"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white shadow hover:bg-primary/90"
        >
          Create Your Mental Health Journal
        </a>
      </section>
    </main>
  );
}

