"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/store/auth-context";
import { UserRole } from "@/types/api";
import { ShieldCheck, UserCheck, Award, ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/Button";

export function DevRoleSwitcher() {
  const { role, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; color: string }> = [
    {
      id: "participant",
      label: "Participant",
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      id: "judge",
      label: "Judge",
      icon: <Award className="w-3.5 h-3.5" />,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "admin",
      label: "Admin",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const currentRoleObj = roles.find((r) => r.id === role) || roles[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer",
          currentRoleObj.color
        )}
        title="Dev Mode: Click to switch active role instantly"
      >
        {currentRoleObj.icon}
        <span className="font-semibold">{currentRoleObj.label}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold border-b border-zinc-800/80 mb-1">
              Switch Dev Role
            </div>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-all text-left cursor-pointer",
                  role === r.id
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                )}
              >
                <div className="flex items-center gap-2">
                  {r.icon}
                  <span>{r.label}</span>
                </div>
                {role === r.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
