"use client";

import { useEffect, useState } from "react"; // Import useEffect
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (usePassword) {
      if (isSignUp) {
        // First try to sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });

        if (error) {
          // If user already exists, try to sign in with magic link to set password
          if (error.message.includes("User already registered")) {
            toast.error("Account exists with this email", {
              description:
                "Please sign in with magic link first to add a password, or use magic link to sign in.",
            });

            // Automatically switch to magic link mode
            setUsePassword(false);
            setIsSignUp(false);
          } else {
            toast.error("Could not create account", {
              description: error.message,
            });
          }
        } else {
          toast.success("Account created! Check your email to verify.");
        }
      } else {
        // Password sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid credentials", {
              description:
                "If you signed up with magic link, please use magic link to sign in first.",
            });
          } else {
            toast.error("Could not authenticate user", {
              description: error.message,
            });
          }
        } else {
          toast.success("Signed in successfully!");
          router.push("/");
        }
      }
    } else {
      // Magic link authentication
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Could not authenticate user", {
          description: error.message,
        });
      } else {
        toast.success("Check your email for the login link!");
      }
    }
    setLoading(false);
  };

  // This effect will run only when the LoginPage is mounted.
  useEffect(() => {
    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // This will only redirect if the user is on the login page and a session is found.
      if (session) {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center">
          {usePassword
            ? isSignUp
              ? "Create Account"
              : "Welcome Back"
            : "Welcome to PanicPrep"}
        </h1>
        <p className="text-center text-muted-foreground text-sm">
          {usePassword
            ? isSignUp
              ? "Create your account with email and password."
              : "Sign in with your email and password."
            : "Enter your email to sign in with a magic link."}
        </p>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {usePassword && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading
            ? "Loading..."
            : usePassword
            ? isSignUp
              ? "Create Account"
              : "Sign In"
            : "Send Magic Link"}
        </Button>

        {/* Toggle between magic link and password */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUsePassword(!usePassword)}
        >
          {usePassword ? "Use magic link instead" : "Use password instead"}
        </Button>

        {/* Toggle between sign in and sign up (only for password mode) */}
        {usePassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </Button>
        )}
      </form>
    </div>
  );
}
