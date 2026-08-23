"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/store/auth-context";
import { UserRole } from "@/types/api";
import {
  UserCheck,
  Award,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Check,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PersonaProfile {
  id: UserRole;
  name: string;
  title: string;
  email: string;
  userId: string;
  avatarBg: string;
  initials: string;
  roleBadgeColor: "info" | "warning" | "success" | "purple";
  permissions: string[];
}

const PROFILES: Record<UserRole, PersonaProfile> = {
  participant: {
    id: "participant",
    name: "Alex Chen",
    title: "Lead Engineer @ NexusAgent",
    email: "alex.chen@hackathon.dev",
    userId: "user_participant",
    avatarBg: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    initials: "AC",
    roleBadgeColor: "info",
    permissions: [
      "Submit Idea, PPT & Code Repos",
      "Run Instant Pre-Judging Diagnostics",
      "Manage Team Submissions",
    ],
  },
  judge: {
    id: "judge",
    name: "Dr. Sarah Jenkins",
    title: "Senior AI Evaluator & Research Judge",
    email: "s.jenkins@stanford.edu",
    userId: "user_judge",
    avatarBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    initials: "SJ",
    roleBadgeColor: "warning",
    permissions: [
      "Access Assigned Projects Queue",
      "Inspect AI Evidence & Claim Dossiers",
      "Submit Human Rubric Scores (30% Weight)",
    ],
  },
  admin: {
    id: "admin",
    name: "Marcus Vance",
    title: "Hackathon Director & Governance Lead",
    email: "marcus.vance@hackathon.global",
    userId: "user_admin",
    avatarBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    initials: "MV",
    roleBadgeColor: "success",
    permissions: [
      "Configure Rubric Weights & Deadlines",
      "Inspect Plagiarism & Similarity Flags",
      "Trigger 70/30 Batch Score Finalization",
      "Reset / Re-Seed Database",
    ],
  },
};

export function UserProfileMenu() {
  const { role, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const currentProfile = PROFILES[role] || PROFILES.admin;

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm group"
        title="Click to view profile & switch role"
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-[10px]",
            currentProfile.avatarBg
          )}
        >
          {currentProfile.initials}
        </div>

        {/* User Name & Role */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-zinc-100 leading-none group-hover:text-white transition-colors">
            {currentProfile.name}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 mt-0.5 capitalize">
            {currentProfile.id}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      </button>

      {/* Profile Dropdown Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-4 specular-border">
            {/* Active User Card */}
            <div className="flex items-start gap-3 pb-3 border-b border-zinc-800/80">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shrink-0",
                  currentProfile.avatarBg
                )}
              >
                {currentProfile.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100 truncate">
                    {currentProfile.name}
                  </span>
                  <Badge variant={currentProfile.roleBadgeColor} size="sm">
                    {currentProfile.id.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-[11px] text-zinc-400 truncate">
                  {currentProfile.title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                  {currentProfile.email}
                </span>
              </div>
            </div>

            {/* Active Permissions Summary */}
            <div className="space-y-1.5 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
                Role Permissions
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-300">
                {currentProfile.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Persona Switcher Buttons */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
                Switch Identity (Dev / Hackathon Demo)
              </div>
              <div className="space-y-1">
                {Object.values(PROFILES).map((p) => {
                  const isSelected = p.id === role;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectRole(p.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-zinc-800/90 border-zinc-700 text-zinc-100"
                          : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-lg border flex items-center justify-center font-mono text-[9px] font-bold shrink-0",
                            p.avatarBg
                          )}
                        >
                          {p.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 capitalize">
                            {p.id} ({p.userId})
                          </span>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign Out / Reset action */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => handleSelectRole("participant")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset to Default Student Persona</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
