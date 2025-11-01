// app/legal/privacy/page.jsx
export const metadata = {
  title: 'Privacy Policy — Anonymotion',
  description: 'How Anonymotion handles, stores, and protects your personal data.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPage() {
  const updated = '2025-11-01'

  return (
    <main className="prose prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-white/60">Last updated: {updated}</p>

      <p>
        This Privacy Policy explains how <strong>Anonymotion</strong> (“we”, “us”) collects, uses,
        stores and protects your information when you use our website and services,
        including the anonymous public feed, private journal, and Premium features.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Anonymotion is an independent personal project operated by an individual developer.
        If you have any privacy-related questions, you can contact us at:
        <br />
        <strong>Email:</strong> anonymotions.team@gmail.com
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address, password hash (if registered by email), or OAuth ID (Google).</li>
        <li><strong>Anonymous posts:</strong> text, emotion, timestamp, and aggregated reactions.</li>
        <li><strong>Private journal:</strong> entries, moods, timestamps, tags — visible only to you.</li>
        <li><strong>Technical data:</strong> IP for security/rate-limiting, browser info, and session cookies.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To operate and improve Anonymotion.</li>
        <li>To manage authentication, password resets, and email verification.</li>
        <li>To prevent abuse and maintain service stability.</li>
        <li>To send transactional emails (via Gmail/Resend).</li>
      </ul>

      <h2>4. Data storage & retention</h2>
      <p>
        Your data is stored securely in a managed PostgreSQL database (hosted by Neon) and optionally cached
        in Upstash Redis for performance. Entries and posts remain until you delete your account or remove them manually.
      </p>

      <h2>5. Cookies & local storage</h2>
      <p>
        We only use essential cookies/local storage for authentication and preferences.
        We do not use third-party advertising or analytics cookies.
      </p>

      <h2>6. Data sharing</h2>
      <p>
        We don’t sell or share your personal data. We use third-party processors only to run the app:
      </p>
      <ul>
        <li><strong>Vercel</strong> — hosting & edge delivery.</li>
        <li><strong>Neon</strong> — PostgreSQL database.</li>
        <li><strong>Upstash</strong> — rate-limiting/cache (if enabled).</li>
        <li><strong>Google</strong> — OAuth login and email delivery via Gmail.</li>
        <li><strong>Stripe</strong> — for payments (planned Premium).</li>
      </ul>

      <h2>7. Your rights (GDPR)</h2>
      <ul>
        <li>Access, correction, and deletion of your data.</li>
        <li>Withdraw consent for specific processing.</li>
        <li>Request data export or account deletion.</li>
      </ul>
      <p>
        To exercise any rights, email us at <strong>anonymotions.team@gmail.com</strong>.
      </p>

      <h2>8. Security</h2>
      <p>
        We use HTTPS, encrypted connections, and hashed passwords. No method is 100% secure,
        but we continuously work to improve protection.
      </p>

      <h2>9. Changes</h2>
      <p>
        Updates to this Privacy Policy will be reflected on this page with a new “Last updated” date.
      </p>

      <h2>10. Contact</h2>
      <p>
        <strong>Email:</strong> anonymotions.team@gmail.com
      </p>
    </main>
  )
}
