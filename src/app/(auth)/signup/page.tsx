"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

import { auth, db } from "~/lib/firebaseClient";
import { useAuth } from "~/hooks/use-auth";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    const parsed = signupSchema.safeParse({ email, password, name });
    if (!parsed.success) {
      setError(
        "Please provide a valid email, name, and a password of at least 6 characters.",
      );
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (name) {
        await updateProfile(userCred.user, { displayName: name });
      }
      const userRef = doc(db, "users", userCred.user.uid);
      await setDoc(
        userRef,
        {
          email,
          role: "admin",
          name,
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
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
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
            minLength={6}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Create account"}
          </button>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
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
