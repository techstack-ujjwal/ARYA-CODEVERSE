"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Award,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Activity,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { FinalizationAPI } from "@/lib/api/finalization";
import { ProjectsAPI } from "@/lib/api/projects";
import { LeaderboardEntry, Hackathon } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSlot, CardBadge } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle, SegmentedToggle } from "@/components/ui/Toggle";

export default function LeaderboardPage() {
  const { error } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Interactive UI Toggles
  const [showPodium, setShowPodium] = useState<boolean>(true);
  const [showDetailedScores, setShowDetailedScores] = useState<boolean>(true);

  const loadHackathons = async () => {
    try {
      const hList = await ProjectsAPI.listHackathons();
      setHackathons(hList || []);
    } catch {
      // Fallback
    }
  };

  const fetchLeaderboard = async (hackId = selectedHackathon) => {
    try {
      setIsLoading(true);
      const data = await FinalizationAPI.getLeaderboard(hackId === "all" ? undefined : hackId);
      setEntries(data || []);
    } catch (err: any) {
      error(err.message || "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  useEffect(() => {
    fetchLeaderboard(selectedHackathon);
  }, [selectedHackathon]);

  const filteredEntries = entries.filter((e) =>
    e.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              JuryX Hackathon Leaderboard
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Calibrated multi-agent rankings by composite formula:{" "}
            <span className="font-mono text-zinc-200 font-semibold">
              Final Score = 70% AI Swarm + 30% Calibrated Human Judge Score
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Hackathon Selector */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200">
            <span className="text-zinc-500 font-mono text-[10px] uppercase">Event:</span>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              <option value="all" className="bg-zinc-900 text-zinc-100">
                All Hackathon Events (Global)
              </option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id} className="bg-zinc-900 text-zinc-100">
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeaderboard(selectedHackathon)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Rankings
          </Button>
        </div>
      </div>

      {/* Interactive UI Controls & Toggles Bar */}
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ranked projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* UI Toggle 1: Podium Showcase */}
          <Toggle
            checked={showPodium}
            onChange={setShowPodium}
            size="sm"
            variant="amber"
            label="Podium Highlights"
          />

          {/* UI Toggle 2: Score Breakdown */}
          <Toggle
            checked={showDetailedScores}
            onChange={setShowDetailedScores}
            size="sm"
            variant="indigo"
            label="70/30 Split Details"
          />
        </div>
      </div>

      {/* Podium Cards for Top 3 (if at least 3 entries exist) */}
      {showPodium && entries.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* #2 Silver */}
          <Card variant="glass" hoverable className="order-2 md:order-1 flex flex-col justify-between p-5 bg-zinc-900/40 border-zinc-700/60">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-zinc-400/10 border border-zinc-400/30 text-zinc-300 flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                <Badge variant="outline" size="sm">SILVER MEDAL</Badge>
              </div>
              <h3 className="text-base font-bold text-zinc-100">{entries[1].project_name}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Rank #2 in tournament standings</p>
            </div>

            <CardSlot variant="muted" className="mt-4 flex justify-between items-end font-mono">
              <span className="text-xs text-zinc-400">Final Score</span>
              <span className="text-xl font-bold text-zinc-200">{entries[1].final_score} <span className="text-xs font-normal text-zinc-500">/ 100</span></span>
            </CardSlot>
          </Card>

          {/* #1 Gold */}
          <Card variant="elevated" hoverable className="order-1 md:order-2 flex flex-col justify-between p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-amber-500/40 shadow-xl shadow-amber-500/5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-sm font-mono font-black shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  1
                </span>
                <Badge variant="warning" size="sm">WINNER • GOLD</Badge>
              </div>
              <h3 className="text-lg font-black text-zinc-100">{entries[0].project_name}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Grand Tournament Champion</p>
            </div>

            <CardSlot variant="warning" className="mt-4 flex justify-between items-end font-mono p-3.5">
              <span className="text-xs text-amber-300/80 font-semibold">Final Composite</span>
              <span className="text-2xl font-black text-amber-400">{entries[0].final_score} <span className="text-xs font-normal text-amber-500/70">/ 100</span></span>
            </CardSlot>
          </Card>

          {/* #3 Bronze */}
          <Card variant="glass" hoverable className="order-3 flex flex-col justify-between p-5 bg-zinc-900/40 border-amber-800/40">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-amber-700/10 border border-amber-700/30 text-amber-500 flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <Badge variant="outline" size="sm">BRONZE MEDAL</Badge>
              </div>
              <h3 className="text-base font-bold text-zinc-100">{entries[2].project_name}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Rank #3 in tournament standings</p>
            </div>

            <CardSlot variant="muted" className="mt-4 flex justify-between items-end font-mono">
              <span className="text-xs text-zinc-400">Final Score</span>
              <span className="text-xl font-bold text-zinc-200">{entries[2].final_score} <span className="text-xs font-normal text-zinc-500">/ 100</span></span>
            </CardSlot>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Activity className="w-6 h-6 animate-spin mb-3 text-zinc-400" />
          <p className="text-xs font-mono">Loading rankings...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-zinc-300">
            {searchQuery ? "No matching projects" : "No finalized results for this hackathon yet"}
          </h4>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto mb-4">
            {searchQuery
              ? "Try another search keyword or clear filter."
              : "Projects appear here once evaluations are completed and composite scores are calculated."}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setSelectedHackathon("all")}>
            View All Events Leaderboard
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60 shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Project Name</th>
                {showDetailedScores && (
                  <>
                    <th className="py-3.5 px-4 text-right">AI Swarm (70%)</th>
                    <th className="py-3.5 px-4 text-right">Human Judge (30%)</th>
                  </>
                )}
                <th className="py-3.5 px-4 text-right">Final Score</th>
                <th className="py-3.5 px-4 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredEntries.map((item) => (
                <tr
                  key={item.project_id}
                  className="hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-zinc-300">
                    {item.rank === 1 ? (
                      <span className="text-amber-400">#01</span>
                    ) : item.rank === 2 ? (
                      <span className="text-zinc-300">#02</span>
                    ) : item.rank === 3 ? (
                      <span className="text-amber-600">#03</span>
                    ) : (
                      `#${String(item.rank).padStart(2, "0")}`
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-zinc-100">
                    <div>
                      <span>{item.project_name}</span>
                    </div>
                  </td>
                  {showDetailedScores && (
                    <>
                      <td className="py-3.5 px-4 text-right text-emerald-400">
                        {item.ai_score}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-400">
                        {item.human_score}
                      </td>
                    </>
                  )}
                  <td className="py-3.5 px-4 text-right font-bold text-zinc-100 text-sm">
                    {item.final_score}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/projects/${item.project_id}/evaluation`}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100 transition-colors font-sans"
                    >
                      <span>Audit</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
