import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignInPage() {
  useEffect(() => {
    signIn("google", { callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center">
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--gold)' }}>
          The CoderJournal
        </p>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-dim)' }}>
          Redirecting to Google...
        </p>
      </div>
    </div>
  );
}