// app/mood-tracker/page.jsx
export const metadata = {
  title: "Best Mood Tracker App — Track Your Emotions Anonymously | Anonymotions",
  description:
    "Track your emotions effortlessly with the best anonymous mood tracker app. No sign-up required. Understand patterns, improve self-awareness, and protect your privacy.",
  openGraph: {
    title: "Best Mood Tracker App — Private & Anonymous | Anonymotions",
    description:
      "Track how you feel daily using the anonymous, private mood tracker designed to help you understand emotional patterns.",
    url: "https://www.anonymotions.com/mood-tracker",
    type: "website",
  },
  alternates: {
  canonical: "https://www.anonymotions.com/mood-tracker",
    },
    twitter: {
    card: "summary_large_image",
    title: "Best Mood Tracker App — Private & Anonymous | Anonymotions",
    description:
        "Track your emotions daily in a fully private, anonymous mood tracking app designed for emotional wellbeing.",
    },
};


export default function MoodTrackerPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      {/* HERO */}
      <section className="text-center mb-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Anonymous Mood Tracker App
        </h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Track your emotional wellbeing daily — privately, securely, and
          without exposing personal details. Understand how your feelings
          change over time and build healthier habits.
        </p>
        <a
          href="/auth/register"
          className="inline-block mt-8 rounded-full bg-pink-600 px-8 py-3 font-medium hover:bg-pink-700 transition"
        >
          Start Tracking Your Mood
        </a>
      </section>

      {/* WHY TRACK MOOD */}
      <section className="mb-20">
        <h2 className="text-3xl font-semibold">Why Use a Mood Tracker?</h2>
        <p className="mt-3 text-white/70 max-w-3xl">
          Mood tracking helps you understand emotional triggers, detect
          patterns, and build healthier routines. With an anonymous journal,
          you can safely record your true feelings without fear of judgment.
        </p>

        <ul className="mt-6 space-y-4 text-white/80">
          <li>• Identify emotional triggers</li>
          <li>• Recognize mental health patterns</li>
          <li>• Improve self-awareness & reflection</li>
          <li>• Track progress in therapy or personal growth</li>
          <li>• Reduce emotional overwhelm by externalizing thoughts</li>
        </ul>
      </section>

      {/* FEATURES */}
      <section className="mb-20">
        <h2 className="text-3xl font-semibold">Features of Our Mood Tracker App</h2>
        <p className="mt-3 text-white/70 max-w-3xl">
          Anonymotions gives you a simple, private, powerful mood tracking
          experience designed for real emotional wellbeing.
        </p>

        <div className="grid sm:grid-cols-2 gap-10 mt-10">
          <div>
            <h3 className="text-xl font-semibold">🌈 Mood Check-ins</h3>
            <p className="text-white/70 mt-1">
              Quickly log how you feel — happy, sad, anxious, angry, or neutral.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">📘 Private Journal</h3>
            <p className="text-white/70 mt-1">
              Write freely in a secure, anonymous journal attached to your mood.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">📊 Emotional Insights</h3>
            <p className="text-white/70 mt-1">
              Visualize how your emotions shift daily, weekly, and monthly.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">🛡️ 100% Anonymous</h3>
            <p className="text-white/70 mt-1">
              No identity required. Your emotional world stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="mb-20">
        <h2 className="text-3xl font-semibold">How to Use the Mood Tracker</h2>
        <p className="mt-3 text-white/70 max-w-3xl">
          You don’t need any experience — just a moment of honesty each day.
        </p>

        <ol className="mt-6 space-y-4 text-white/80 list-decimal ml-6">
          <li>Select your mood for the day</li>
          <li>Add a journal entry to describe what influenced it</li>
          <li>Save your entry securely and revisit anytime</li>
          <li>Watch your emotional patterns evolve in the stats dashboard</li>
        </ol>
      </section>

      {/* CTA */}
      <section className="text-center mb-24">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Start Tracking How You Feel — Privately
        </h2>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          Your emotional wellbeing matters. Begin your anonymous journey today.
        </p>
        <a
          href="/auth/register"
          className="inline-block mt-8 rounded-full bg-pink-600 px-8 py-3 font-medium hover:bg-pink-700 transition"
        >
          Create a Free Account
        </a>
      </section>

      {/* FAQ SECTION */}
      <section className="mb-20">
        <h2 className="text-3xl font-semibold mb-6">FAQ</h2>
        
        <div className="space-y-6">
          <details className="bg-white/5 p-4 rounded-xl border border-white/10">
            <summary className="cursor-pointer text-lg font-medium">
              Is the mood tracker really anonymous?
            </summary>
            <p className="mt-2 text-white/70">
              Yes — we never require your real identity. Your entries and emotions are encrypted and private.
            </p>
          </details>

          <details className="bg-white/5 p-4 rounded-xl border border-white/10">
            <summary className="cursor-pointer text-lg font-medium">
              Do I need an account?
            </summary>
            <p className="mt-2 text-white/70">
              You can create an account with an anonymous email — no personal info required.
            </p>
          </details>

          <details className="bg-white/5 p-4 rounded-xl border border-white/10">
            <summary className="cursor-pointer text-lg font-medium">
              Can I track emotions daily?
            </summary>
            <p className="mt-2 text-white/70">
              Yes — you can log multiple entries per day and view trends over time.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
