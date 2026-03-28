"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError("");
        setEmail("");
        setPassword("");
        setSignUpSuccess(true);
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An error occurred";
      // Better error messages for common auth issues
      if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("no email found")) {
        setError("Email not found or not confirmed. Please check your email for confirmation link.");
      } else if (errorMessage.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in. Check your inbox for the confirmation link.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-3 sm:px-4 overflow-hidden">
      {/* Decorative gradient orbs - hidden on mobile */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl hidden sm:block" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl hidden sm:block" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-lg shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50" />
          <div className="relative p-6 sm:p-10">
            {/* Logo and Title */}
            <div className="mb-8 sm:mb-10 text-center">
              <div className="mb-3 sm:mb-4 inline-flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                <span className="text-lg sm:text-xl font-bold text-white">✎</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Noted</h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                {isSignUp
                  ? "Create your account and start writing"
                  : "Welcome back to your notes"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:outline-none text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:outline-none text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>

              {/* Success Message - Email Confirmation */}
              {signUpSuccess && !error && (
                <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-green-50 p-3 sm:p-4 text-xs sm:text-sm text-green-700 border border-green-200">
                  <span className="mt-0.5">✓</span>
                  <div>
                    <p className="font-semibold">Account created successfully!</p>
                    <p className="mt-1">A confirmation email has been sent to <strong>{email}</strong>. Please click the link in the email to confirm your account before logging in.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700 border border-red-200">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 sm:py-3 font-semibold text-white rounded-lg sm:rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-5 sm:mt-6 text-sm sm:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 sm:my-7 flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                {isSignUp ? "Already have an account? " : "New to Noted? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSignUpSuccess(false);
                  }}
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {isSignUp ? "Sign In" : "Create one"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!signUpSuccess && (
          <p className="mt-4 sm:mt-6 text-center text-xs text-slate-400">
            Your notes, your privacy, always encrypted
          </p>
        )}
      </div>
    </div>
  );
}
