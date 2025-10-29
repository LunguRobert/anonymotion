// app/auth/reset/page.jsx  — SERVER COMPONENT (fără "use client")
import ResetPasswordForm from '@/components/auth/reset/ResetPasswordForm'

export const metadata = {
  title: 'Reset password',
  description: 'Choose a new password for your account.',
}

export default function Page({ searchParams }) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : ''
  // const email = typeof searchParams?.email === 'string' ? searchParams.email : ''
  return <ResetPasswordForm token={token} />
}
