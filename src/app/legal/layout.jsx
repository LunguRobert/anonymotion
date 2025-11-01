// app/legal/layout.jsx
export const metadata = {
  title: 'Legal — Anonymotion',
  description: 'Legal pages including Privacy Policy and Terms of Service for Anonymotion.',
}

export default function LegalLayout({ children }) {
  return (
    <div className="bg-background min-h-[100svh] text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-12">
        {children}
      </div>
    </div>
  )
}
