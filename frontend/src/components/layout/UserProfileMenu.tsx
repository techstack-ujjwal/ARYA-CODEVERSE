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
  roleBadgeColor: "default" | "success" | "danger" | "info";
  permissions: string[];
}

const PROFILES: Record<UserRole, PersonaProfile> = {
  participant: {
    id: "participant",
    name: "Alex Chen",
    title: "Lead Engineer @ NexusAgent",
    email: "alex.chen@hackathon.dev",
    userId: "user_participant",
    avatarBg: "bg-[#DDE4F8] text-[#3A4B86] border-[#BAC7E8]",
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
    avatarBg: "bg-[#D8EAD9] text-[#2D5A36] border-[#B5D7B7]",
    initials: "SJ",
    roleBadgeColor: "success",
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
    avatarBg: "bg-[#F5DCD7] text-[#7A3A30] border-[#E8B8B0]",
    initials: "MV",
    roleBadgeColor: "danger",
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
        className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-all cursor-pointer shadow-2xs group"
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
          <span className="text-xs font-semibold text-[#18181B] leading-none">
            {currentProfile.name}
          </span>
          <span className="text-[9px] font-mono text-[#71717A] mt-0.5 capitalize">
            {currentProfile.id}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-[#71717A] group-hover:text-[#18181B] transition-colors" />
      </button>

      {/* Profile Dropdown Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8E3D8] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-4 text-[#18181B]">
            {/* Active User Card */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#E8E3D8]">
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
                  <span className="text-sm font-bold text-[#18181B] truncate">
                    {currentProfile.name}
                  </span>
                  <Badge variant={currentProfile.roleBadgeColor} size="sm">
                    {currentProfile.id.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-[11px] text-[#52525B] truncate">
                  {currentProfile.title}
                </span>
                <span className="text-[10px] font-mono text-[#71717A] mt-0.5 truncate">
                  {currentProfile.email}
                </span>
              </div>
            </div>

            {/* Active Permissions Summary */}
            <div className="space-y-1.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D8]">
              <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider font-semibold">
                Role Permissions
              </div>
              <ul className="space-y-1 text-[11px] text-[#52525B]">
                {currentProfile.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-[#2D5A36] shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Persona Switcher Buttons */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider font-semibold">
                Switch Identity (Studio Demo)
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
                          ? "bg-[#18181B] text-white border-[#18181B] dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 shadow-xs"
                          : "bg-[#FAF8F5] border-[#E8E3D8] hover:bg-[#F4EFE6] text-[#18181B]"
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
                          <span className={cn("text-[10px] font-mono capitalize", isSelected ? "text-zinc-300" : "text-[#71717A]")}>
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
            <div className="pt-2 border-t border-[#E8E3D8]">
              <button
                onClick={() => handleSelectRole("participant")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer font-medium"
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
