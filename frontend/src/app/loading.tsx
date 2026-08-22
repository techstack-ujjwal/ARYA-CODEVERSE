import React from "react";
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 space-y-3">
      <Activity className="w-8 h-8 animate-spin text-zinc-400" />
      <p className="text-xs font-mono tracking-wide text-zinc-400">Loading pipeline view...</p>
    </div>
  );
}
