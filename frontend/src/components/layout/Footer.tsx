import React from "react";
import Link from "next/link";
import { Terminal, Shield, Sparkles, GitBranch } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/60 bg-zinc-950/60 py-6 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
              JX
            </div>
            <span className="font-bold text-zinc-200">JuryX</span>
            <span className="text-zinc-500 font-normal">Autonomous Evaluation Platform</span>
          </div>
          <span className="text-zinc-700">•</span>
          <span className="font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px]">v2.0</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>17 Parallel Agents</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Claim & Evidence Grounding</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-sky-400" />
            <span>70% AI + 30% Human</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
