"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Volume2,
  Play,
  Pause,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export type Slide = {
  slideIndex: number;
  title: string;
  slide_png_url: string;
  audio_url: string;
};

type SlidesPlayerProps = {
  slides: Slide[];
  onExit?: () => void;
};

export default function SlidesPlayer({ slides, onExit }: SlidesPlayerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple derived state
  const activeSlide = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  // Setup audio when slide changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop any current playback
    audio.pause();

    // Set up the new audio source
    audio.src = activeSlide.audio_url;
    audio.playbackRate = playbackSpeed;
    audio.loop = false;
    audio.load();

    // Resume playback if we were playing before or are auto-advancing
    if (hasUserInteracted && (isPlaying || isAdvancing)) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            audio.playbackRate = playbackSpeed;
            setIsPlaying(true);
            setIsAdvancing(false);
          })
          .catch((err) => {
            console.error("Failed to play audio:", err);
            setIsPlaying(false);
            setIsAdvancing(false);
          });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, activeSlide.audio_url]);

  // Update audio speed when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log("Audio ended, auto advance:", autoAdvance);
      setIsPlaying(false);

      if (autoAdvance && !isLastSlide) {
        setIsAdvancing(true);
        // Add a small delay for better UX
        setTimeout(() => {
          setCurrentSlide((prev) => prev + 1);
        }, 1500);
      }
    };

    // Simple event handlers
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
      audio.removeEventListener("ended", handleEnded);
    };
  }, [autoAdvance, isLastSlide]);

  // Handle fullscreen changes
  useEffect(() => {
    document.addEventListener("fullscreenchange", () => {
      setIsFullscreen(!!document.fullscreenElement);
    });

    return () => {
      document.removeEventListener("fullscreenchange", () => {
        setIsFullscreen(!!document.fullscreenElement);
      });
    };
  }, []);

  // Navigation controls
  const goToNextSlide = () => {
    if (!isLastSlide) setCurrentSlide((prev) => prev + 1);
  };

  const goToPrevSlide = () => {
    if (!isFirstSlide) setCurrentSlide((prev) => prev - 1);
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    setHasUserInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        audioRef.current.playbackRate = playbackSpeed;
        await audioRef.current.play();
        audioRef.current.playbackRate = playbackSpeed;
      } catch (error) {
        console.error("Audio toggle failed:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
      toast.error("Fullscreen not supported in this browser");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center ${
        isFullscreen ? "h-screen w-screen bg-black" : "h-screen w-screen"
      } p-4 sm:p-8`}
    >
      {/* Preload next slide image */}
      {!isLastSlide && (
        <link
          rel="preload"
          as="image"
          href={slides[currentSlide + 1].slide_png_url}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-4">
        <div className="flex items-center gap-4">
          <h1
            className={`text-3xl font-bold ${isFullscreen ? "text-white" : ""}`}
          >
            {activeSlide.title}
          </h1>
          <span
            className={`text-lg font-medium ${
              isFullscreen ? "text-white" : ""
            }`}
          >
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoAdvance ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoAdvance(!autoAdvance)}
          >
            Auto: {autoAdvance ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Slide Display */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-full" : "max-w-4xl aspect-video"
        } bg-gray-900 rounded-lg overflow-hidden shadow-2xl`}
      >
        <Image
          src={activeSlide.slide_png_url}
          alt={activeSlide.title}
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Navigation */}
        <div
          className={`flex rounded-lg overflow-hidden border ${
            isFullscreen
              ? "bg-black/80 backdrop-blur-sm text-white border-gray-600"
              : ""
          }`}
        >
          <Button
            onClick={goToPrevSlide}
            disabled={isFirstSlide}
            variant="outline"
            size="lg"
            className={`rounded-none border-0 border-r ${
              isFirstSlide ? "opacity-50 cursor-not-allowed" : ""
            } ${
              isFullscreen
                ? "bg-black/60 text-white border-gray-600 hover:bg-black/40 hover:text-white"
                : ""
            }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="lg"
            className={`rounded-none border-0 border-r ${
              isFullscreen
                ? "bg-black/60 text-white border-gray-600 hover:bg-black/40 hover:text-white"
                : ""
            }`}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            onClick={goToNextSlide}
            disabled={isLastSlide}
            variant="outline"
            size="lg"
            className={`rounded-none border-0 ${
              isLastSlide ? "opacity-50 cursor-not-allowed" : ""
            } ${
              isFullscreen
                ? "bg-black/60 text-white border-gray-600 hover:bg-black/40 hover:text-white"
                : ""
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Speed Control */}
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 border shadow-xs
            ${
              isFullscreen
                ? "bg-black/80 backdrop-blur-sm text-white border-gray-600"
                : "bg-background"
            }`}
        >
          <Volume2 className="h-4 w-4" />
          <span className="text-sm font-medium">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className={`rounded px-2 py-1 text-sm min-w-[60px] ${
              isFullscreen
                ? "bg-black/60 text-white border-gray-600"
                : "border border-border"
            }`}
            title="Playback speed"
            aria-label="Playback speed"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* Fullscreen */}
        <Button
          variant="outline"
          size="lg"
          onClick={toggleFullscreen}
          className={`border ${
            isFullscreen
              ? "bg-black/80 backdrop-blur-sm text-white border-gray-600"
              : ""
          }`}
        >
          {isFullscreen ? (
            <Minimize className="h-6 w-6" />
          ) : (
            <Maximize className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {/* Visual indicator for auto-advance */}
      {isAdvancing && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">
          Advancing to next slide...
        </div>
      )}
    </div>
  );
}
