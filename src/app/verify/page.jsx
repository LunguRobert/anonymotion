// app/verify/page.jsx
export default function VerifyPage({ searchParams }) {
  const raw = searchParams?.status
  const status = Array.isArray(raw) ? raw[0] : raw ?? null

  return (
    <main className="mx-auto max-w-md p-6">
      {status === 'success' ? (
        <>
          <h1 className="text-2xl font-semibold">Email verified ✅</h1>
          <p className="mt-2">Your account is now active.</p>
        </>
      ) : status === 'expired' ? (
        <>
          <h1 className="text-2xl font-semibold">Link expired or invalid</h1>
          <p className="mt-2">Please request a new verification email from Settings → Account.</p>
        </>
      ) : status === 'missing' ? (
        <>
          <h1 className="text-2xl font-semibold">Email verification</h1>
          <p className="mt-2">You need to request a verification email first.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Email verification</h1>
          <p className="mt-2">Unknown status.</p>
        </>
      )}
    </main>
  )
}
