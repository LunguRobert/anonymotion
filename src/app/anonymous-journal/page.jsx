// app/page.jsx  (sau app/landing/page.jsx)
import Link from 'next/link'

export const metadata = {
  title: 'Anonymotions – Anonymous Emotional Journal & Private Mood Tracker',
  description:
    'Write honestly in a fully anonymous emotional journal. Track your mood, visualize your mind as constellations, and discover patterns over time – all in a private, secure space.',
  alternates: {
    canonical: 'https://www.anonymotions.com/',
  },
  openGraph: {
    title: 'Anonymotions – Anonymous Emotional Journal & Private Mood Tracker',
    description:
      'A private, anonymous emotional journaling app that helps you process feelings, track mood, and see your mind as a constellation of moments.',
    url: 'https://www.anonymotions.com/',
    siteName: 'Anonymotions',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anonymotions – Anonymous Emotional Journal & Private Mood Tracker',
    description:
      'Anonymous emotional journaling, mood tracking, and mindful insights – in a safe, private space.',
  },
}

// small helper
function Bullet({ title, body }) {
  return (
    <li className="flex gap-3">
      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
      <div>
        <p className="text-sm font-medium text-inverted">{title}</p>
        <p className="mt-1 text-sm text-muted">{body}</p>
      </div>
    </li>
  )
}

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Anonymotions',
    url: 'https://www.anonymotions.com/',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    description:
      'Anonymotions is an anonymous emotional journaling web app that lets you track your mood, write freely, and visualize your mind as constellations over time.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available. Optional premium features.',
    },
    potentialAction: {
      '@type': 'Action',
      name: 'Start journaling anonymously',
      target: 'https://www.anonymotions.com/auth/signin',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Anonymotions really anonymous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. Anonymotions is designed so you can write freely without public profiles or social pressure. Your entries are private by default and not shared publicly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Anonymotions a mental health or therapy service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Anonymotions is a journaling and self-reflection tool, not a replacement for therapy, diagnosis, or professional mental health care.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to use my real name?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. You can sign up with an email address, but your journal space does not require a real name. It is made for private emotional reflection.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Anonymotions have a free version?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. You can start journaling on Anonymotions for free. Some advanced features, like extended stats or extra visualizations, may be part of a future premium plan.',
        },
      },
    ],
  }

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-background text-text">
        {/* subtle top gradient line (like in /user layout) */}
        <div
          aria-hidden
          className="sticky top-0 z-[1] h-px w-full bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/35 to-pink-400/30"
        />

        {/* main wrapper */}
        <main className="relative mx-auto flex min-h-[calc(100vh-1px)] max-w-6xl flex-col px-4 pb-16 pt-10 md:pt-14">
          {/* background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(900px 600px at 10% 0%, rgba(236,72,153,0.18), transparent 55%), radial-gradient(900px 600px at 90% 100%, rgba(56,189,248,0.16), transparent 55%)',
            }}
          />

          {/* HERO */}
          <section
            id="top"
            className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center"
          >
            {/* Left side */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/70 bg-surface/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Anonymous emotional journaling
              </span>

              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-inverted sm:text-4xl md:text-5xl">
                An{' '}
                <span className="bg-gradient-to-r from-pink-500 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                  anonymous journal
                </span>{' '}
                for everything you feel.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Anonymotions is a private emotional journal and mood tracker.
                Write without judgment, track how you feel over time, and see
                your mind as a constellation of moments &mdash; not a feed of
                likes.
              </p>

              {/* Primary CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/40 transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                >
                  Start free
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-secondary bg-surface/80 px-5 py-2.5 text-sm font-medium text-inverted/90 hover:bg-card transition"
                >
                  See how it works
                </Link>
                <p className="w-full text-xs text-muted sm:w-auto">
                  No public profile. No followers. Just you and your thoughts.
                </p>
              </div>

              {/* Trust / benefit mini row */}
              <div className="mt-6 grid gap-3 text-xs text-muted sm:grid-cols-3">
                <div className="rounded-2xl border border-secondary/70 bg-card/70 p-3">
                  <p className="font-semibold text-inverted/90">Anonymous space</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Journal without a public identity or social pressure. Your
                    entries stay private.
                  </p>
                </div>
                <div className="rounded-2xl border border-secondary/70 bg-card/70 p-3">
                  <p className="font-semibold text-inverted/90">Emotional insights</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Track moods, see streaks, and notice patterns in how you feel.
                  </p>
                </div>
                <div className="rounded-2xl border border-secondary/70 bg-card/70 p-3">
                  <p className="font-semibold text-inverted/90">Made for reflection</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    No doomscrolling, no algorithm. Just a calm interface to check in with yourself.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side – app preview card */}
            <div className="relative">
              <div className="glow-lamp pointer-events-none absolute inset-0 -z-10" />
              <div className="relative overflow-hidden rounded-3xl border border-secondary bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur">
                {/* top bar */}
                <div className="flex items-center justify-between border-b border-secondary/80 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      ✦
                    </span>
                    <span className="font-medium text-inverted/90">
                      Today&apos;s emotional check-in
                    </span>
                  </div>
                  <span className="rounded-full bg-card px-3 py-1 text-[11px] text-muted">
                    Private session
                  </span>
                </div>

                {/* mock content */}
                <div className="space-y-4 px-4 pb-4 pt-3">
                  <div className="rounded-2xl border border-secondary/80 bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      Quick prompt
                    </p>
                    <p className="mt-1 text-sm text-inverted">
                      &ldquo;If your emotions today were weather, what would the
                      forecast look like?&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      How are you feeling?
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {['😊 Happy', '😬 Anxious', '😢 Sad', '😐 Neutral'].map(
                        (label) => (
                          <button
                            key={label}
                            type="button"
                            className="rounded-full border border-secondary bg-card px-3 py-1 text-xs text-muted hover:text-inverted hover:bg-surface transition"
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      Your private entry
                    </p>
                    <div className="rounded-2xl border border-secondary bg-card/80 p-3">
                      <p className="text-xs leading-relaxed text-muted">
                        &ldquo;Today felt heavy but also a little hopeful.
                        Writing this down makes it easier to breathe.&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-muted">
                      <span className="font-medium text-inverted/80">
                        Mind Constellation
                      </span>{' '}
                      · last 30 days
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
                      View map
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="mt-16 space-y-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-inverted sm:text-2xl">
                Built for emotional journaling, not social media.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Anonymotions combines anonymous journaling, mood tracking and
                gentle visualizations to help you understand what you feel over
                time &mdash; without turning your emotions into content.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-secondary bg-surface/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Journaling
                </p>
                <h3 className="mt-1 text-base font-semibold text-inverted">
                  A calm space to write
                </h3>
                <ul className="mt-3 space-y-2">
                  <Bullet
                    title="Guided & free-form entries"
                    body="Use soft prompts when you’re stuck, or write freely when you already know what you want to say."
                  />
                  <Bullet
                    title="Searchable history"
                    body="Look back on past entries, see what was happening the last time you felt this way."
                  />
                  <Bullet
                    title="Journal lock (premium)"
                    body="Extra protection for your journal so only you can unlock new entries."
                  />
                </ul>
              </div>

              <div className="rounded-3xl border border-secondary bg-surface/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Mood tracking
                </p>
                <h3 className="mt-1 text-base font-semibold text-inverted">
                  See your feelings over time
                </h3>
                <ul className="mt-3 space-y-2">
                  <Bullet
                    title="Mood heatmaps"
                    body="Spot clusters of stressful days or long stretches of calm at a glance."
                  />
                  <Bullet
                    title="Streaks & patterns"
                    body="Notice when you’ve been checking in with yourself regularly &mdash; or avoiding it."
                  />
                  <Bullet
                    title="Stats, not scores"
                    body="We show patterns, not judgments. No “good” or “bad” scores for your emotions."
                  />
                </ul>
              </div>

              <div className="rounded-3xl border border-secondary bg-surface/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Visual insights
                </p>
                <h3 className="mt-1 text-base font-semibold text-inverted">
                  Mind Constellation
                </h3>
                <ul className="mt-3 space-y-2">
                  <Bullet
                    title="Stars from your journal"
                    body="Each entry becomes a star, positioned by emotion and date, so you can literally see your mind."
                  />
                  <Bullet
                    title="Streak lines"
                    body="Entries connect into lines, revealing stretches of consistent check-ins."
                  />
                  <Bullet
                    title="Always up to date"
                    body="Regenerate the constellation as you write new entries and watch your inner sky change."
                  />
                </ul>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="mt-16 grid gap-8 md:grid-cols-[1.2fr_minmax(0,1fr)]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-inverted sm:text-2xl">
                How Anonymotions works
              </h2>
              <ol className="space-y-4 text-sm text-muted">
                <li>
                  <span className="font-semibold text-inverted/90">
                    1. Start your private space
                  </span>
                  <br />
                  Create an account with your email or Google. You don&apos;t
                  need a real name or a public profile.
                </li>
                <li>
                  <span className="font-semibold text-inverted/90">
                    2. Check in with your emotions
                  </span>
                  <br />
                  Choose how you feel, answer a gentle prompt, or just write
                  whatever is on your mind. Entries are saved for you only.
                </li>
                <li>
                  <span className="font-semibold text-inverted/90">
                    3. Notice patterns over time
                  </span>
                  <br />
                  Explore your mood heatmaps, streaks, and mind constellation to
                  see what days tend to feel heavier, lighter, or more balanced.
                </li>
                <li>
                  <span className="font-semibold text-inverted/90">
                    4. Return whenever you need to process something
                  </span>
                  <br />
                  Use your journal as an anchor when life feels overwhelming,
                  confusing, or simply loud.
                </li>
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/40 transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                >
                  Start journaling
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-muted hover:text-inverted"
                >
                  View plans &nbsp;→
                </Link>
              </div>
            </div>

            {/* mini reassurance card */}
            <div className="rounded-3xl border border-secondary bg-surface/90 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                A quick note
              </p>
              <p className="mt-2 text-sm text-muted">
                Anonymotions is a journaling and self-reflection tool, not a
                mental health service or a replacement for therapy. If you are
                in crisis or need professional support, please reach out to a
                qualified mental health professional or local emergency
                services.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mt-16">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-inverted sm:text-2xl">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-muted">
                Answers to common questions about anonymity, privacy, and how
                Anonymotions fits into your emotional toolkit.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-secondary bg-surface/90 p-4">
                <h3 className="text-sm font-semibold text-inverted">
                  Is my journal really anonymous?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Your entries are private and not shared to a public profile or
                  feed. Anonymotions is built so you can express yourself
                  honestly, without worrying about followers or public comments.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary bg-surface/90 p-4">
                <h3 className="text-sm font-semibold text-inverted">
                  Is this therapy?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  No. Anonymotions is not therapy and does not replace
                  professional help. It is a journaling and reflection tool that
                  can live alongside therapy, coaching, or other support.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary bg-surface/90 p-4">
                <h3 className="text-sm font-semibold text-inverted">
                  Do I have to pay to use it?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  You can start for free and write in your journal without
                  paying. Some advanced insights and features are part of a
                  premium plan, which you can decide to upgrade to later.
                </p>
              </div>

              <div className="rounded-2xl border border-secondary bg-surface/90 p-4">
                <h3 className="text-sm font-semibold text-inverted">
                  Can I export my data?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Yes. You can export your entries to keep a copy for yourself
                  or share it with a therapist or trusted person if you choose
                  to.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER-like small section */}
          <section className="mt-16 rounded-3xl border border-secondary bg-surface/90 px-5 py-6 text-center">
            <h2 className="text-lg font-semibold text-inverted sm:text-xl">
              Ready to start your anonymous emotional journal?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Take a few minutes to check in with yourself today. Future you
              will be glad you did.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/40 transition hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                Start free
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted hover:text-inverted"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-sm font-medium text-muted hover:text-inverted"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-medium text-muted hover:text-inverted"
              >
                Terms
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
