"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DevRoleSwitcher } from "./DevRoleSwitcher";
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-black text-sm tracking-tighter shadow-sm">
              Æ
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-100 font-mono">
                EVAL ENGINE
              </span>
              <span className="text-[9px] font-mono text-zinc-500 -mt-1 tracking-wider uppercase">
                v2.0 Multi-Agent
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
                      ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
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
                  ? "bg-rose-500"
                  : "bg-amber-400"
              )}
            />
            <span className="text-zinc-300 font-semibold">API</span>
            {agentStatus && (
              <span className="text-zinc-500 flex items-center gap-0.5 ml-1">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] text-zinc-300">17 Agents</span>
              </span>
            )}
          </button>

          <DevRoleSwitcher />

          <Link
            href="/dashboard"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-all font-semibold shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
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
                    "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-zinc-800 text-zinc-100 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isBackendHealthy ? "bg-emerald-400" : "bg-rose-500"
                )}
              />
              Backend: {isBackendHealthy ? "Online" : "Offline"}
            </span>
            <button
              onClick={checkHealth}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Re-check
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
