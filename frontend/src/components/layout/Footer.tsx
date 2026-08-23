"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Shield, Sparkles, GitBranch, Cpu, Trophy, Layers, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E3D8] bg-[#F4EFE6] pt-12 pb-8 text-[#52525B] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E2DDD0]">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-2 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center text-xs font-mono font-bold">
                JX
              </div>
              <span className="font-mono font-extrabold text-sm text-[#18181B] tracking-tight">
                Jury<span className="text-[#3A4B86]">X</span>
              </span>
              <span className="text-[10px] font-mono text-[#2D5A36] bg-[#D8EAD9] font-bold px-2 py-0.5 rounded-full ml-1">
                Multi-Agent Swarm
              </span>
            </Link>
            <p className="text-xs text-[#52525B] leading-relaxed font-normal">
              Autonomous hackathon evaluation &amp; deterministic claim verification engine. Powered by 17 specialized AI agents, AST cyclomatic analyzers, and 70/30 calibrated human scoring.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-[#18181B] font-bold tracking-wider">
              Studio Portals
            </div>
            <ul className="space-y-2 text-xs text-[#52525B]">
              <li>
                <Link href="/dashboard" className="hover:text-[#18181B] transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Participant Workspace</span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#18181B] transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#3A4B86]" />
                  <span>Tournament Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link href="/judge" className="hover:text-[#18181B] transition-colors flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Judge Scoring Queue</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#18181B] transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#7A3A30]" />
                  <span>Admin Control Room</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Engine Architecture */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-[#18181B] font-bold tracking-wider">
              Verification Matrix
            </div>
            <ul className="space-y-2 text-xs text-[#52525B] font-mono">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#2D5A36]" />
                <span>17 Parallel Agents</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Radon AST &amp; Bandit Scanners</span>
              </li>
              <li className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#3A4B86]" />
                <span>70% AI + 30% Judge Formula</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7A3A30]" />
                <span>Sub-90s Diagnostic SLA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & status bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717A]">
          <div>
            <span>© {new Date().getFullYear()} JuryX Evaluation Engine. Grounded Multi-Agent Verification.</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#18181B] font-semibold">17 Agents Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
