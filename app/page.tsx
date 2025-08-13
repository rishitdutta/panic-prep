"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Upload, Edit3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative">
      {/* Top Center Logo */}
      <div className="text-center pt-8 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">PanicPrep</h1>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            How do you want to learn?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose your preferred method to create an engaging presentation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Upload Option */}
          <Link href="/upload">
            <div className="group h-full relative overflow-hidden rounded-2xl border bg-background p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] min-h-[280px]">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Upload Materials</h3>
                <p className="text-muted-foreground leading-relaxed text-base px-4">
                  Upload your notes, lecture slides, or course materials and
                  we'll create a presentation for you
                </p>
                <div className="text-sm text-primary font-medium mt-3">
                  Supports PDF →
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Prompt Option */}
          <Link href="/prompt">
            <div className="group h-full relative overflow-hidden rounded-2xl border bg-background p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] min-h-[280px]">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Edit3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Enter Topics</h3>
                <p className="text-muted-foreground leading-relaxed text-base px-4">
                  Simply enter a topic or list of topics and we'll research and
                  create a comprehensive presentation
                </p>
                <div className="text-sm text-primary font-medium mt-3">
                  AI-powered research and content →
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-base text-muted-foreground">
            Learn in minutes, not days!
          </p>
        </div>
      </main>

      {/* Floating Logout Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleLogout}
        className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl transition-all bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-2"
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
