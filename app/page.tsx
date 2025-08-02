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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold ">PanicPrep</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            How do you want to learn?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your preferred method to create an engaging presentation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Option */}
          <Link href="/upload">
            <div className="group relative overflow-hidden rounded-xl border bg-background p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Upload Materials</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your notes, lecture slides, or course materials and
                  we'll create a presentation for you
                </p>
                <div className="text-sm text-primary font-medium">
                  Supports PDF →
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Prompt Option */}
          <Link href="/prompt">
            <div className="group relative overflow-hidden rounded-xl border bg-background p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Edit3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Enter Topics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Simply enter a topic or list of topics and we'll research and
                  create a comprehensive presentation
                </p>
                <div className="text-sm text-primary font-medium">
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
          <p className="text-sm text-muted-foreground">
            Learn in minutes, not hours
          </p>
        </div>
      </main>
    </div>
  );
}
