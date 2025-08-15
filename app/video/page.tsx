"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import SlidesPlayer, { Slide } from "@/components/SlidesPlayer";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VideoPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load slides data
  useEffect(() => {
    const videoData = localStorage.getItem("videoData");
    const presentationData = localStorage.getItem("presentationData");

    if (videoData) {
      try {
        const parsedData: Slide[] = JSON.parse(videoData);
        parsedData.sort((a, b) => a.slideIndex - b.slideIndex);
        setSlides(parsedData);

        // Try to get jobId from localStorage
        if (presentationData) {
          const { jobId: storedJobId } = JSON.parse(presentationData);
          setJobId(storedJobId);
        }
      } catch (error) {
        toast.error("Could not load video data.");
        router.push("/upload");
      }
    } else {
      toast.error("No video data found.");
      router.push("/upload");
    }
    setIsLoading(false);
  }, [router]);

  const handleDownloadVideo = async () => {
    if (!jobId) {
      toast.error("Job ID not found. Cannot download video.");
      return;
    }

    setIsDownloading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      toast.error("API URL is not configured.");
      setIsDownloading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication error. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}/presentation/download_video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const result = await response.json();
      const videoUrl = `${apiUrl}${result.video_url}`;

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `presentation_${jobId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Video download started!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to download video", { description: errorMessage });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading presentation...
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p>No slides found. Please try generating a new presentation.</p>
        <Button onClick={() => router.push("/upload")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header with download button */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="bg-black/60 backdrop-blur-sm text-white border-gray-600 hover:bg-black/40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button
          onClick={handleDownloadVideo}
          disabled={isDownloading || !jobId}
          className="bg-primary/90 backdrop-blur-sm hover:bg-primary"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Video"}
        </Button>
      </div>

      <SlidesPlayer slides={slides} onExit={() => router.push("/")} />
    </div>
  );
}
