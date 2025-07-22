import * as z from "zod";

export const promptSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
});

export type PromptSchema = z.infer<typeof promptSchema>;
