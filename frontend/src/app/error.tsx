"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to client console or monitoring service
    console.error("Next.js App Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card variant="subtle" className="max-w-md w-full border-rose-500/30 bg-rose-500/5 p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-zinc-100">Something went wrong</h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            {error.message || "An unexpected error occurred while rendering this page."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button variant="primary" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
