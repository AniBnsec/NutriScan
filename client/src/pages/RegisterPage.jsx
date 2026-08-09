import { SignUp } from '@clerk/clerk-react';
import AuthLayout from '../components/auth/AuthLayout';
import { clerkAppearance } from '../components/auth/clerkTheme';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}

