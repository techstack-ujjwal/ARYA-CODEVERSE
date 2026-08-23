"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfileMenu } from "./UserProfileMenu";
import { useAuth } from "@/lib/store/auth-context";
import { HealthAPI } from "@/lib/api/health";
import {
  Activity,
  Layers,
  Trophy,
  Award,
  ShieldCheck,
  PlusCircle,
  Cpu,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const checkHealth = async () => {
    try {
      await HealthAPI.check();
      setIsBackendHealthy(true);
      const agents = await HealthAPI.checkAgents();
      setAgentStatus(agents);
    } catch {
      setIsBackendHealthy(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Workspace", icon: <Layers className="w-4 h-4" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
  ];

  if (role === "judge" || role === "admin") {
    navLinks.push({
      href: "/judge",
      label: "Judge Queue",
      icon: <Award className="w-4 h-4" />,
    });
  }

  if (role === "admin") {
    navLinks.push({
      href: "/admin",
      label: "Admin Room",
      icon: <ShieldCheck className="w-4 h-4" />,
    });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E3D8] bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-15 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
              JX
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-[#18181B] font-mono">
                  Jury<span className="text-[#3A4B86]">X</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2D5A36] bg-[#D8EAD9] px-2 py-0.2 rounded-full">
                  Swarm v2.4
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    isActive
                      ? "bg-[#18181B] text-white shadow-sm"
                      : "text-[#52525B] hover:text-[#18181B] hover:bg-[#F4EFE6]"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Health Pulse & Dev Switcher */}
        <div className="flex items-center gap-3">
          {/* Live Backend Connection Indicator */}
          <button
            onClick={checkHealth}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3D8] text-[11px] font-mono hover:border-[#D6CFBE] transition-colors cursor-pointer shadow-xs"
            title={`Backend Core: ${isBackendHealthy ? "Connected (FastAPI :8000)" : "Disconnected / Offline"}. Click to re-check.`}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isBackendHealthy === true
                  ? "bg-[#10B981] animate-pulse"
                  : isBackendHealthy === false
                  ? "bg-red-500"
                  : "bg-zinc-400"
              )}
            />
            <span className="text-[#18181B] font-semibold">API</span>
            {agentStatus && (
              <span className="text-[#71717A] flex items-center gap-0.5 ml-1">
                <Cpu className="w-3 h-3 text-[#3A4B86]" />
                <span className="text-[10px] text-[#18181B] font-bold">17 Agents</span>
              </span>
            )}
          </button>

          <UserProfileMenu />

          <Link
            href="/dashboard"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#52525B] hover:text-[#18181B] hover:bg-[#F4EFE6] border border-[#E8E3D8] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 text-[#18181B]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E3D8] bg-[#FAF8F5] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                    isActive
                      ? "bg-[#18181B] text-white"
                      : "text-[#52525B] hover:text-[#18181B] hover:bg-[#F4EFE6]"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E8E3D8] flex items-center justify-between text-xs font-mono text-[#52525B]">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isBackendHealthy ? "bg-[#10B981]" : "bg-red-500"
                )}
              />
              {isBackendHealthy ? "FastAPI Online" : "Backend Offline"}
            </span>
            <span>Role: {role}</span>
          </div>
        </div>
      )}
    </header>
  );
}
