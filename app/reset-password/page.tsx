"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Eye, EyeOff, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      setMessage("Your password has been updated. Redirecting to sign in...");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError((err as Error).message || "Could not update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-3 sm:px-4 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl hidden sm:block" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl hidden sm:block" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-lg shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50" />
          <div className="relative p-6 sm:p-10">
            <div className="mb-8 sm:mb-10 text-center">
              <div className="mb-3 sm:mb-4 inline-flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Pencil className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Reset Password
              </h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">
                Choose a new password for your Notivo account
              </p>
            </div>

            {!loading && !user ? (
              <div className="rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700 border border-red-200">
                This reset link is invalid or expired. Please request a new one.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <PasswordInput
                  label="New Password"
                  value={password}
                  showPassword={showPassword}
                  onChange={setPassword}
                  onTogglePassword={() =>
                    setShowPassword((current) => !current)
                  }
                />

                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  showPassword={showPassword}
                  onChange={setConfirmPassword}
                  onTogglePassword={() =>
                    setShowPassword((current) => !current)
                  }
                />

                {message && (
                  <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-green-50 p-3 sm:p-4 text-xs sm:text-sm text-green-700 border border-green-200">
                    <Check
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-lg sm:rounded-xl bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700 border border-red-200">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 sm:py-3 font-semibold text-white rounded-lg sm:rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-5 sm:mt-6 text-sm sm:text-base"
                >
                  {isLoading || loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-4 sm:mt-6 text-center text-xs text-slate-400">
          Your notes, your privacy, always encrypted
        </p>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  showPassword,
  onChange,
  onTogglePassword,
}: {
  label: string;
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onTogglePassword: () => void;
}) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 pr-11 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:outline-none text-sm sm:text-base"
          placeholder="Password"
        />
        <button
          type="button"
          onClick={onTogglePassword}
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
  );
}
