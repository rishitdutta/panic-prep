"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Topic = {
  topic: string;
  subtopics: string[];
};

function VideoStructureComponent() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const outlineStr = searchParams.get("outline");
    const id = searchParams.get("jobId");

    if (id) {
      setJobId(id);
    }

    if (outlineStr) {
      try {
        const outlineData = JSON.parse(outlineStr);
        // The API returns an array of {topic: string, subtopics: string[]}
        // This matches our Topic type.
        setTopics(outlineData);
      } catch (error) {
        console.error("Failed to parse outline data:", error);
        toast.error("Could not load video structure.");
        // Optionally redirect back or show an error state
        router.push("/upload");
      }
    } else {
      // Handle case where outline is missing
      toast.error("No video structure data found.");
      router.push("/upload");
    }
  }, [searchParams, router]);

  const handleNextClick = async () => {
    if (!jobId || topics.length === 0) {
      toast.error("Missing job ID or outline to build presentation.");
      return;
    }

    // Store data in localStorage to pass to the generating page
    localStorage.setItem(
      "presentationData",
      JSON.stringify({ jobId, outline: topics })
    );

    router.push("/generating");
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Video Structure</h1>
      <div className="flex flex-col gap-4">
        {topics.map((topic, index) => (
          <Card key={index} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{`${index + 1}. ${topic.topic}`}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log("Editing:", topic.topic)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log("Deleting:", topic.topic)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {topic.subtopics.join(", ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleNextClick}>
          Generate Presentation
        </Button>
      </div>
    </div>
  );
}

export default function VideoStructurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoStructureComponent />
    </Suspense>
  );
}
