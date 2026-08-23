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
  RefreshCw,
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
    { href: "/dashboard", label: "Dashboard", icon: <Layers className="w-4 h-4" /> },
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-xl specular-border">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-sm">
              <span className="font-mono font-black text-sm tracking-tight text-white">
                JX
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white font-mono">
                  Jury<span className="text-emerald-400">X</span>
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 -mt-0.5 tracking-wider uppercase">
                Autonomous AI Jury
              </span>
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
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
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
        <div className="flex items-center gap-2.5">
          {/* Live Backend Connection Indicator */}
          <button
            onClick={checkHealth}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono hover:border-zinc-700 transition-colors cursor-pointer"
            title={`Backend Core: ${isBackendHealthy ? "Connected (FastAPI :8000)" : "Disconnected / Offline"}. Click to re-check.`}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isBackendHealthy === true
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : isBackendHealthy === false
                  ? "bg-red-500"
                  : "bg-zinc-500"
              )}
            />
            <span className="text-zinc-300 font-semibold">API</span>
            {agentStatus && (
              <span className="text-zinc-500 flex items-center gap-0.5 ml-1">
                <Cpu className="w-3 h-3 text-zinc-400" />
                <span className="text-[10px] text-zinc-300">17 Agents</span>
              </span>
            )}
          </button>

          <UserProfileMenu />

          <Link
            href="/dashboard"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
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
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isBackendHealthy ? "bg-emerald-400" : "bg-red-500"
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
