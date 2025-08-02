"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function SetupPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [supabase, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast.error("Could not set password", {
        description: error.message,
      });
    } else {
      toast.success(
        "Password set successfully! You can now sign in with either method."
      );
      router.push("/upload");
    }

    setLoading(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center">Set Up Password</h1>
        <p className="text-center text-muted-foreground text-sm">
          Add a password to your account for faster sign-ins.
        </p>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password">New Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Setting up..." : "Set Password"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/upload")}
        >
          Skip for now
        </Button>
      </form>
    </div>
  );
}
