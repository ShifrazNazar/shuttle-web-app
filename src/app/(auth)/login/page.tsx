"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

import { auth, db } from "~/lib/firebaseClient";
import { useAuth } from "~/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Please provide a valid email and password.");
      return;
    }
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCred.user.uid);
      await setDoc(
        userRef,
        {
          email: userCred.user.email,
          role: "admin",
          name: userCred.user.displayName ?? "Admin User",
        },
        { merge: true },
      );
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Shuttle Admin</h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Need an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <p className="text-destructive text-center text-sm">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
