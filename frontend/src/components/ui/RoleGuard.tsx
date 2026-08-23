"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, UserCheck, Award, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { UserRole } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function RoleGuard({
  allowedRoles,
  title,
  description,
  children,
}: RoleGuardProps) {
  const { role, setRole } = useAuth();

  const isAllowed = allowedRoles.includes(role);

  if (isAllowed) {
    return <>{children}</>;
  }

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    participant: {
      label: "Participant",
      icon: <UserCheck className="w-4 h-4 text-sky-400" />,
      color: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    },
    judge: {
      label: "Judge",
      icon: <Award className="w-4 h-4 text-amber-400" />,
      color: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    admin: {
      label: "Admin",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
  };

  const requiredRoleLabel = allowedRoles
    .map((r) => roleMeta[r]?.label || r)
    .join(" or ");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 w-full">
      <Card variant="elevated" className="border-amber-500/30 bg-zinc-950/80 p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.15)]">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Access Restricted
          </div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            {title || `${requiredRoleLabel} Access Required`}
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            {description ||
              `You are currently viewing as ${role.toUpperCase()}. This control portal is restricted to authorized ${requiredRoleLabel} accounts.`}
          </p>
        </div>

        {/* Quick Role Switcher for Dev / Evaluation */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-400">Current Role:</span>
            <Badge variant="outline" size="sm">
              {role.toUpperCase()}
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400">
            Switch your profile identity in dev mode to test this portal:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {allowedRoles.map((r) => (
              <Button
                key={r}
                size="sm"
                variant="secondary"
                onClick={() => setRole(r)}
                leftIcon={roleMeta[r]?.icon}
                className="text-xs font-semibold"
              >
                Switch to {roleMeta[r]?.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
