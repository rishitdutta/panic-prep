"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function GeneratingPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const buildPresentation = async () => {
      const storedData = localStorage.getItem("presentationData");
      if (!storedData) {
        toast.error("Presentation data not found.");
        router.push("/upload");
        return;
      }

      const { jobId, outline } = JSON.parse(storedData);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error("API URL is not configured.");
        router.push("/upload");
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication error", {
            description: "You are not logged in.",
          });
          router.push("/login");
          return;
        }
        const authToken = session.access_token;

        const response = await fetch(
          `${apiUrl}/presentation/build_presentation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              job_id: jobId,
              outline: outline,
              voice: "af_heart", // make it selectable
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        const presentationResult = await response.json();

        // Store result for video page and navigate
        localStorage.setItem("videoData", JSON.stringify(presentationResult));
        router.push("/video");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        toast.error("Failed to generate presentation", {
          description: errorMessage,
        });
        router.push("/video-structure"); // Go back to the previous step
      } finally {
        // Clean up local storage
        localStorage.removeItem("presentationData");
      }
    };

    buildPresentation();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-12 w-12 animate-spin" />
      <h1 className="text-2xl font-semibold">
        Generating your presentation...
      </h1>
      <p className="text-muted-foreground">This may take a few moments.</p>
    </div>
  );
}
