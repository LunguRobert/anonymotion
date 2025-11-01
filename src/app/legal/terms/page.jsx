// app/legal/terms/page.jsx
export const metadata = {
  title: 'Terms of Service — Anonymotion',
  description: 'The rules that govern the use of Anonymotion.',
  alternates: { canonical: '/legal/terms' },
}

export default function TermsPage() {
  const updated = '2025-11-01'

  return (
    <main className="prose prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-white/60">Last updated: {updated}</p>

      <p>
        Welcome to <strong>Anonymotion</strong>. By using this site and its services,
        you agree to these Terms of Service. Please read them carefully.
      </p>

      <h2>1. About the Service</h2>
      <p>
        Anonymotion offers an anonymous emotional feed and a private journaling space.
        It is not a medical or psychological service. If you need help or are in crisis,
        please contact local emergency or mental health professionals.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 16 years old to use Anonymotion.</li>
        <li>You are responsible for keeping your login credentials secure.</li>
        <li>You may log in using email/password or Google OAuth.</li>
      </ul>

      <h2>3. Content Rules</h2>
      <ul>
        <li>No hate speech, harassment, or personal attacks.</li>
        <li>No illegal, explicit, or violent content.</li>
        <li>No attempts to identify or expose other users.</li>
        <li>We reserve the right to remove posts or suspend accounts violating these rules.</li>
      </ul>

      <h2>4. Premium (Planned)</h2>
      <p>
        Premium unlocks extra features such as private journaling, filters, and exports.
        Payments will be processed securely via <strong>Stripe</strong>.
        Refund policy will be published before payments are enabled.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        You retain ownership of the content you create. By posting anonymously,
        you grant us a non-exclusive license to display and store your posts to operate the service.
      </p>

      <h2>6. Lock Journal</h2>
      <p>
        Lock Journal keeps your private entries password-protected locally.
        If Premium expires, the lock remains until you disable it or delete entries.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        The service is provided “as is.” We make no warranties and are not liable for any indirect damages.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time. We may suspend or terminate accounts
        that violate these Terms or abuse the service.
      </p>

      <h2>9. Changes</h2>
      <p>
        These Terms may be updated periodically. Continued use after changes means you accept them.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any questions or concerns, contact us at:
        <br />
        <strong>Email:</strong> anonymotions.team@gmail.com
      </p>
    </main>
  )
}
