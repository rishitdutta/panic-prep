"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Form from "next/form";
import { handleSubmit, ServerResult } from "../form-actions";

import React, { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState: ServerResult = { success: false, message: "" };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting" : "Submit Prompt"}
    </Button>
  );
}
function PromptPage() {
  const [state, formAction] = useActionState(handleSubmit, initialState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Form action={formAction} className="flex flex-col gap-4 min-w-md">
        <div className="flex flex-col gap-4">
          <Label htmlFor="textBox">Enter Topics:</Label>
          <Textarea
            id="textBox"
            className="min-h-[100px] max-h-[400px]"
            name="prompt"
            placeholder="Type your list of topics here..."
          />
        </div>
        <Button type="submit" className="max-w-24" variant="outline" size="lg">
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default PromptPage;
