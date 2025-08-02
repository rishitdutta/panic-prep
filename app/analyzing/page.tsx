"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function AnalyzingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const analyze = async () => {
      const keysParam = searchParams.get("keys");
      if (!keysParam) {
        toast.error("Material keys not found in URL.");
        router.push("/upload");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        toast.error("API URL is not configured.");
        router.push("/upload");
        return;
      }

      try {
        const materialKeys = JSON.parse(keysParam);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication error. Please log in.");
          router.push("/login");
          return;
        }
        const authToken = session.access_token;

        const analyzeUrl = `${apiUrl}/presentation/analyze_materials`;
        const analyzeResponse = await fetch(analyzeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ material_keys: materialKeys }),
        });

        if (!analyzeResponse.ok) {
          throw new Error(
            `Analysis failed with status: ${analyzeResponse.status}`
          );
        }

        const result = await analyzeResponse.json();
        const { job_id, outline } = result;

        // Redirect to the video structure page with the results
        const queryParams = new URLSearchParams({
          jobId: job_id,
          outline: JSON.stringify(outline),
        });
        router.push(`/video-structure?${queryParams.toString()}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        toast.error("Failed to analyze materials", {
          description: errorMessage,
        });
        router.push("/upload"); // Go back to the start
      }
    };

    analyze();
  }, [router, searchParams, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-12 w-12 animate-spin" />
      <h1 className="text-2xl font-semibold">Analyzing your materials...</h1>
      <p className="text-muted-foreground">This may take a few moments.</p>
    </div>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyzingComponent />
    </Suspense>
  );
}
