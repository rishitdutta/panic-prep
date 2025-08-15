"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Topic = {
  topic: string;
  subtopics: string[];
};

// Utility function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/__(.*?)__/g, "$1") // Remove __underline__
    .replace(/_(.*?)_/g, "$1") // Remove _italic_
    .trim();
};

// Sortable Topic Item Component
function SortableTopicItem({
  topic,
  index,
  onEdit,
  onDelete,
}: {
  topic: Topic;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `topic-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`gap-2 ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <CardTitle className="flex-1">
            {`${index + 1}. ${cleanMarkdown(topic.topic)}`}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(index)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {topic.subtopics.map(cleanMarkdown).join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}

function VideoStructureComponent() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTopic, setEditingTopic] = useState({
    topic: "",
    subtopics: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const outlineStr = searchParams.get("outline");
    const id = searchParams.get("jobId");

    if (id) {
      setJobId(id);
    }

    if (outlineStr) {
      try {
        const outlineData = JSON.parse(outlineStr);
        // Clean markdown formatting from the data
        const cleanedTopics = outlineData.map((topic: Topic) => ({
          topic: cleanMarkdown(topic.topic),
          subtopics: topic.subtopics.map(cleanMarkdown),
        }));
        setTopics(cleanedTopics);
      } catch (error) {
        console.error("Failed to parse outline data:", error);
        toast.error("Could not load video structure.");
        router.push("/upload");
      }
    } else {
      toast.error("No video structure data found.");
      router.push("/upload");
    }
  }, [searchParams, router]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTopics((items) => {
        const activeIndex = items.findIndex(
          (_, i) => `topic-${i}` === active.id
        );
        const overIndex = items.findIndex((_, i) => `topic-${i}` === over?.id);
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  const handleEdit = (index: number) => {
    const topic = topics[index];
    setEditingIndex(index);
    setEditingTopic({
      topic: topic.topic,
      subtopics: topic.subtopics.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      setTopics((prev) => prev.filter((_, i) => i !== index));
      toast.success("Topic deleted successfully");
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const subtopicsArray = editingTopic.subtopics
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      setTopics((prev) =>
        prev.map((topic, index) =>
          index === editingIndex
            ? { topic: editingTopic.topic, subtopics: subtopicsArray }
            : topic
        )
      );

      setIsEditDialogOpen(false);
      setEditingIndex(null);
      setEditingTopic({ topic: "", subtopics: "" });
      toast.success("Topic updated successfully");
    }
  };

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
      <p className="text-muted-foreground mb-6">
        Drag topics to reorder them, or use the edit/delete buttons to modify
        content.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={topics.map((_, index) => `topic-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {topics.map((topic, index) => (
              <SortableTopicItem
                key={`topic-${index}`}
                topic={topic}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleNextClick}>
          Generate Presentation
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="topic-title" className="text-sm font-medium">
                Topic Title
              </label>
              <Input
                id="topic-title"
                value={editingTopic.topic}
                onChange={(e) =>
                  setEditingTopic((prev) => ({
                    ...prev,
                    topic: e.target.value,
                  }))
                }
                placeholder="Enter topic title..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="subtopics" className="text-sm font-medium">
                Subtopics (comma-separated)
              </label>
              <Textarea
                id="subtopics"
                value={editingTopic.subtopics}
                onChange={(e) =>
                  setEditingTopic((prev) => ({
                    ...prev,
                    subtopics: e.target.value,
                  }))
                }
                placeholder="Enter subtopics separated by commas..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
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
