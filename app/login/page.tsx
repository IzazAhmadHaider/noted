"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Check, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setMessage("Password reset instructions have been sent to your email.");
      } else if (isSignUp) {
        const submittedEmail = email;
        await signUp(email, password);
        setError("");
        setEmail("");
        setPassword("");
        setSignUpSuccess(true);
        setIsSignUp(false);
        setMessage(`A confirmation email has been sent to ${submittedEmail}.`);
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An error occurred";
      // Better error messages for common auth issues
      if (
        errorMessage.includes("Invalid login credentials") ||
        errorMessage.includes("no email found")
      ) {
        setError(
          "Email not found or not confirmed. Please check your email for confirmation link.",
        );
      } else if (errorMessage.includes("Email not confirmed")) {
        setError(
          "Please confirm your email before logging in. Check your inbox for the confirmation link.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const returnToSignIn = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
    setError("");
    setMessage("");
    setSignUpSuccess(false);
    setShowPassword(false);
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
                <Pencil className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Notivo
              </h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                {isForgotPassword
                  ? "Enter your email to reset your password"
                  : isSignUp
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

              {!isForgotPassword && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 pr-11 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:outline-none text-sm sm:text-base"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!isSignUp && !isForgotPassword && (
                <div className="-mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setMessage("");
                      setSignUpSuccess(false);
                    }}
                    className="text-xs sm:text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Success Message */}
              {(signUpSuccess || message) && !error && (
                <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-green-50 p-3 sm:p-4 text-xs sm:text-sm text-green-700 border border-green-200">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      {isForgotPassword
                        ? "Check your email"
                        : "Account created successfully!"}
                    </p>
                    <p className="mt-1">
                      {message ||
                        "Please click the link in the email to confirm your account before logging in."}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700 border border-red-200">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    aria-hidden="true"
                  />
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
                ) : isForgotPassword ? (
                  "Send Reset Link"
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
                {isForgotPassword
                  ? "Remembered your password? "
                  : isSignUp
                    ? "Already have an account? "
                    : "New to Notivo? "}
                <button
                  type="button"
                  onClick={() => {
                    if (isForgotPassword) {
                      returnToSignIn();
                      return;
                    }

                    setIsSignUp(!isSignUp);
                    setError("");
                    setMessage("");
                    setSignUpSuccess(false);
                    setShowPassword(false);
                  }}
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {isForgotPassword ? "Sign In" : isSignUp ? "Sign In" : "Create one"}
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
