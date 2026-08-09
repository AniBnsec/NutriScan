import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '../components/auth/AuthLayout';
import { clerkAppearance } from '../components/auth/clerkTheme';

export default function LoginPage() {
  return (
    <AuthLayout>
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/register"
        forceRedirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}

