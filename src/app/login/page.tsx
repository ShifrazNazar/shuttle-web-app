"use client";

import { useState } from "react";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "~/lib/firebaseClient";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("signup");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = credentialsSchema.safeParse({ email, password, name });
    if (!parsed.success) {
      setError(
        "Please provide a valid email, name, and a password of at least 6 characters.",
      );
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
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
      } else {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const userRef = doc(db, "users", userCred.user.uid);
        await setDoc(
          userRef,
          {
            email: userCred.user.email,
            role: "admin",
            name: userCred.user.displayName ?? name,
          },
          { merge: true },
        );
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ maxWidth: 360, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Firebase {mode === "signup" ? "Sign up" : "Login"}
      </h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Login"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            style={{
              background: "transparent",
              border: "none",
              color: "#555",
              cursor: "pointer",
            }}
          >
            {mode === "signup"
              ? "Have an account? Login"
              : "Need an account? Sign up"}
          </button>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </div>
      </form>
    </div>
  );
}
