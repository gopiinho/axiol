"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { setAuthToken } from "@/lib/auth";
import { AlertCircle, Lock, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const loginMutation = useMutation(api.auth.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (password.length < 12) {
        throw new Error("Password must be at least 12 characters");
      }

      let ipAddress: string | undefined;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        ipAddress = undefined;
      }

      const result = await loginMutation({
        email,
        password,
        ipAddress,
        userAgent: navigator.userAgent,
      });

      setAuthToken(result.token, result.expiresAt);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";

      if (errorMessage.includes("locked")) {
        setError(errorMessage);
      } else if (errorMessage.includes("Invalid")) {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (errorMessage.includes("attempt")) {
        setError(errorMessage);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-2xl bg-card p-8 space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900"> Login</h2>
            <p className="text-gray-500 mt-2">
              Sign in to access the dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border "
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={12}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 12 characters required
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
