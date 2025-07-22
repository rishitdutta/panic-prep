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
  //send to api
  /* try{
    const apiResponse = await fetch("api-url",{
      method="POST",
      body= JSON.stringify({userPrompt: validPrompt})
    });
    if(!apiResponse.ok) throw new Error("API Submission failed");
  } catch (apiResponse) {
    return {success:false, message: "Failed to submit to external API."}
  } */

  //dummy return
  redirect("/video-structure");
}
