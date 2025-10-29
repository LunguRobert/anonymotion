export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Email verified ✅</h1>
        <p className="text-gray-700 mb-6">
          Your email has been successfully verified. You can now log in to Anonymous Journal.
        </p>
        <a
          href="/auth/signin"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}
