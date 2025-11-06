// app/legal/privacy/page.jsx
export const metadata = {
  title: 'Privacy Policy — Anonymotion',
  description: 'How Anonymotion handles, stores, and protects your personal data.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPage() {
  const updated = '2025-11-01' // update this when you change the policy

  return (
    <main className="prose prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-white/60">Last updated: {updated}</p>

      <p>
        This Privacy Policy explains how <strong>Anonymotion</strong> (“we”, “us”) collects, uses,
        stores, and protects your information when you use our website and services,
        including the anonymous public feed, private journal, and Premium features.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Anonymotion is an independent personal project operated by an individual developer.
        For any privacy-related questions, contact:<br />
        <strong>Email:</strong> anonymotions.team@gmail.com
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address, password hash (if you register by email), or OAuth ID (Google).</li>
        <li><strong>Anonymous posts:</strong> text, emotion, timestamp, and aggregated reactions.</li>
        <li><strong>Private journal:</strong> entries, moods, timestamps, tags — visible only to you.</li>
        <li><strong>Technical data:</strong> IP (for security and rate-limiting), browser information, and session cookies.</li>
        <li><strong>Analytics (only with consent):</strong> page views and basic usage events collected via Google Analytics 4 (GA4).</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To operate, secure, and improve Anonymotion.</li>
        <li>To manage authentication, password resets, and email verification.</li>
        <li>To prevent abuse and maintain service stability (e.g., rate limiting, fraud prevention).</li>
        <li>To send essential transactional emails (e.g., sign-in links, password resets).</li>
        <li>To understand anonymized product usage (analytics) <em>only if you consent</em>.</li>
      </ul>

      <h2>4. Legal bases (GDPR)</h2>
      <ul>
        <li><strong>Contract necessity</strong> (Art. 6(1)(b)): to provide the service (account, journal, feed).</li>
        <li><strong>Legitimate interests</strong> (Art. 6(1)(f)): security, abuse prevention, service reliability.</li>
        <li><strong>Consent</strong> (Art. 6(1)(a)): analytics cookies and GA4. You can withdraw consent at any time.</li>
      </ul>

      <h2>5. Data storage & retention</h2>
      <p>
        Your data is stored securely in a managed PostgreSQL database (hosted by <strong>Neon</strong>) and may be cached
        in <strong>Upstash Redis</strong> for performance. We retain account data while your account is active.
        You can delete entries and posts at any time; deleting your account removes your personal data from our systems,
        subject to backup and legal obligations.
      </p>

      <h2>6. Cookies & Consent Mode</h2>
      <p>
        We use essential cookies for authentication and preferences. With your consent, we use
        <strong> Google Analytics 4</strong> which may set analytics cookies. We implement Google’s
        <strong> Consent Mode v2</strong>: until you accept, analytics cookies are not stored and signals are limited.
      </p>

      <h2>7. Data sharing (processors)</h2>
      <p>We don’t sell your personal data. We use third-party processors to run the app:</p>
      <ul>
        <li><strong>Render</strong> — hosting and CDN for the web app.</li>
        <li><strong>Neon</strong> — managed PostgreSQL database.</li>
        <li><strong>Upstash</strong> — rate limiting and cache / pub-sub.</li>
        <li><strong>Google</strong> — OAuth for login; <em>Google Analytics 4</em> for analytics (with consent).</li>
        <li><strong>Email provider</strong> — Gmail/Resend for transactional emails.</li>
        <li><strong>Stripe</strong> — payments (for planned Premium features).</li>
      </ul>

      <h2>8. International data transfers</h2>
      <p>
        Our providers may process data in the EU and the US. When data is transferred outside your region,
        we rely on appropriate safeguards such as Standard Contractual Clauses (SCCs) or equivalent mechanisms
        offered by our providers.
      </p>

      <h2>9. Your rights (GDPR/UK GDPR)</h2>
      <ul>
        <li>Access, correction, deletion of your data.</li>
        <li>Withdraw consent for analytics at any time.</li>
        <li>Data portability and restriction of processing in certain cases.</li>
        <li>Right to lodge a complaint with your local supervisory authority.</li>
      </ul>
      <p>To exercise your rights, email <strong>anonymotions.team@gmail.com</strong>.</p>

      <h2>10. Security</h2>
      <p>
        We use HTTPS, encrypted connections, and hashed passwords. While no method is 100% secure,
        we continuously improve our safeguards.
      </p>

      <h2>11. Children</h2>
      <p>
        Anonymotion is not intended for children under 13. If you believe a child provided personal data,
        contact us to remove it.
      </p>

      <h2>12. Changes</h2>
      <p>
        Any updates to this Privacy Policy will be posted here with a new “Last updated” date.
      </p>

      <h2>13. Contact</h2>
      <p><strong>Email:</strong> anonymotions.team@gmail.com</p>
    </main>
  )
}
