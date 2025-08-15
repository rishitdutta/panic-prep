"use server";

import { z } from "zod";
import { promptSchema } from "@/lib/validator";
import { redirect } from "next/navigation";

export interface ServerResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  submittedValue?: string;
}

export async function handleSubmit(
  prevState: ServerResult,
  formData: FormData
): Promise<ServerResult> {
  const rawPrompt = formData.get("prompt") as string;
  const toValidate = { prompt: rawPrompt };
  const validated = promptSchema.safeParse(toValidate);
  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    console.log("Server side validation errors", fieldErrors);
    return {
      success: false,
      message: "Validation failed",
      errors: { prompt: fieldErrors.prompt },
    };
  }
  const validPrompt = validated.data.prompt;
  console.log("Validation successful, Prompt:", validPrompt);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return {
        success: false,
        message: "API URL is not configured.",
      };
    }

    // Call the topic outline API endpoint
    const response = await fetch(`${apiUrl}/presentation/topic_outline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add authorization when auth is implemented
        // "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        topics: validPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const { job_id, outline } = result;

    // Redirect to video structure page with the generated outline
    const queryParams = new URLSearchParams({
      jobId: job_id,
      outline: JSON.stringify(outline),
    });
    redirect(`/video-structure?${queryParams.toString()}`);
  } catch (error) {
    console.error("Failed to generate topic outline:", error);
    return {
      success: false,
      message: "Failed to generate topic outline. Please try again.",
    };
  }
}
