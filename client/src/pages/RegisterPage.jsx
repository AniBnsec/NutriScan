import { SignUp } from '@clerk/clerk-react';
import AuthLayout from '../components/auth/AuthLayout';
import { clerkAppearance } from '../components/auth/clerkTheme';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/register"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}

