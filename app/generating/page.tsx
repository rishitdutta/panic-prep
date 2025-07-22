"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function GeneratingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/video");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-12 w-12 animate-spin" />
      <h1 className="text-2xl font-semibold">Generating your content...</h1>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
