"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

type Slide = {
  slideIndex: number;
  title: string;
  slide_png_url: string;
  audio_url: string;
};

function VideoPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  useEffect(() => {
    const videoData = localStorage.getItem("videoData");
    if (videoData) {
      try {
        const parsedData: Slide[] = JSON.parse(videoData);
        // Sort slides by index just in case they are out of order
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
  }, [router]);

  useEffect(() => {
    // Play audio when the slide changes
    if (slides.length > 0 && audioRef.current) {
      audioRef.current.src = slides[currentSlide].audio_url;
      audioRef.current
        .play()
        .catch((e) => console.error("Audio play failed:", e));
    }
  }, [currentSlide, slides]);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading presentation...
      </div>
    );
  }

  const activeSlide = slides[currentSlide];

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen p-4 sm:p-8">
      {/* Preload the next slide's image for a smoother transition */}
      {currentSlide < slides.length - 1 && (
        <link
          rel="preload"
          as="image"
          href={slides[currentSlide + 1].slide_png_url}
        />
      )}
      <h1 className="text-3xl font-bold mb-4">{activeSlide.title}</h1>
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <Image
          src={activeSlide.slide_png_url}
          alt={activeSlide.title}
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button onClick={goToPrevSlide} disabled={currentSlide === 0} size="lg">
          <ChevronLeft className="h-6 w-6" />
          Prev
        </Button>
        <span className="text-lg font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
        <Button
          onClick={goToNextSlide}
          disabled={currentSlide === slides.length - 1}
          size="lg"
        >
          Next
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <audio ref={audioRef} className="mt-4" controls hidden />
    </div>
  );
}

export default VideoPage;
