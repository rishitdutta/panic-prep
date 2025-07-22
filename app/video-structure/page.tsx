"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { dummyVideoStructure } from "@/lib/dummy-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type Topic = {
  id: number;
  title: string;
  description: string;
  estimatedDuration: string;
};

export default function VideoStructurePage() {
  const [topics, setTopics] = useState<Topic[]>(dummyVideoStructure.topics);
  const router = useRouter();

  const handleNextClick = () => {
    router.push("/generating");
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Video Structure</h1>
      <div className="flex flex-col gap-4">
        {topics.map((topic, index) => (
          <Card key={topic.id} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{`${index + 1}. ${topic.title}`}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log("Editing:", topic.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log("Deleting:", topic.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>{topic.description}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {topic.estimatedDuration}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleNextClick}>
          Next
        </Button>
      </div>
    </div>
  );
}
