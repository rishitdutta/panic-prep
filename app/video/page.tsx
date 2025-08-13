"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import SlidesPlayer, { Slide } from "@/components/SlidesPlayer";

export default function VideoPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load slides data
  useEffect(() => {
    const videoData = localStorage.getItem("videoData");
    if (videoData) {
      try {
        const parsedData: Slide[] = JSON.parse(videoData);
        parsedData.sort((a, b) => a.slideIndex - b.slideIndex);
        setSlides(parsedData);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading presentation...
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        No slides found. Please try generating a new presentation.
      </div>
    );
  }

  return <SlidesPlayer slides={slides} onExit={() => router.push("/")} />;
}
