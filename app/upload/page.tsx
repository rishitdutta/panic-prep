"use client";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Loader2, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function UploadPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleProcessClick = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to process.");
      return;
    }

    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      toast.error("Client-side error: API URL is missing.");
      setIsLoading(false);
      return;
    }

    try {
      // --- Get Auth Token ---
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication error. Please log in again.");
      }
      const authToken = session.access_token;
      const authHeader = { Authorization: `Bearer ${authToken}` };

      // --- Step 1: Upload Files ---
      toast.info("Step 1 of 3: Uploading files...");
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const uploadResponse = await fetch(
        `${apiUrl}/presentation/upload_materials`,
        { method: "POST", headers: authHeader, body: formData }
      );
      if (!uploadResponse.ok) throw new Error("File upload failed.");
      const { material_keys } = await uploadResponse.json();

      // --- Step 2: Analyze Materials ---
      toast.info("Step 2 of 3: Analyzing materials...");
      const analyzeResponse = await fetch(
        `${apiUrl}/presentation/analyze_materials`,
        {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ material_keys }),
        }
      );
      if (!analyzeResponse.ok) throw new Error("Material analysis failed.");
      const { job_id, outline } = await analyzeResponse.json();

      // --- Step 3: Build Presentation ---
      toast.info("Step 3 of 3: Generating presentation...");
      const buildResponse = await fetch(
        `${apiUrl}/presentation/build_presentation`,
        {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ job_id, outline, voice: "af_heart" }),
        }
      );
      if (!buildResponse.ok) throw new Error("Presentation generation failed.");
      const presentationResult = await buildResponse.json();

      // --- Final Step: Navigate to Video ---
      toast.success("Presentation ready!");
      localStorage.setItem("videoData", JSON.stringify(presentationResult));
      router.push("/video");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("An error occurred", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" was rejected.`,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <h1 className="text-2xl font-semibold">Processing your request...</h1>
        <p className="text-muted-foreground">This may take a few moments.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upload Your Materials</h1>
        <p className="text-muted-foreground mt-2">
          Select your files and we'll handle the rest.
        </p>
      </div>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        maxFiles={10}
        maxSize={5 * 1024 * 1024}
        className="w-full max-w-md"
        onFileReject={onFileReject}
        multiple
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">Drag & drop files here</p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 10 files, up to 5MB each)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList className="flex flex-col gap-2 w-full">
          {files.map((file, index) => (
            <FileUploadItem
              key={index}
              value={file}
              className="p-2 border rounded-lg flex justify-between items-center gap-2"
            >
              <span className="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {file.name}
              </span>
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
      <Button
        size="lg"
        onClick={handleProcessClick}
        disabled={files.length === 0 || isLoading}
      >
        {isLoading ? "Processing..." : "Create Presentation"}
      </Button>
    </div>
  );
}

export default UploadPage;
