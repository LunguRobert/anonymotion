import ForgotPasswordForm from '@/components/auth/forgot/ForgotPasswordForm'

export const metadata = {
  title: 'Forgot password',
  description: 'Request a password reset link.',
}

export default function Page() {
  return <ForgotPasswordForm />
}
