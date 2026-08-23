"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Search,
  ChevronRight,
  Activity,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { FinalizationAPI } from "@/lib/api/finalization";
import { ProjectsAPI } from "@/lib/api/projects";
import { LeaderboardEntry, Hackathon } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSlot, CardBadge } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-[#FAF8F5] text-[#18181B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3D8]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E3D8] flex items-center justify-center text-[#18181B] shadow-2xs">
              <Trophy className="w-4.5 h-4.5 text-[#3A4B86]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] tracking-tight">
              JuryX Tournament Leaderboard
            </h1>
          </div>
          <p className="text-xs text-[#52525B] mt-1">
            Calibrated multi-agent rankings by composite formula:{" "}
            <span className="font-mono text-[#18181B] font-semibold">
              Final Score = 70% AI Swarm + 30% Calibrated Human Judge Score
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Hackathon Selector */}
          <div className="flex items-center gap-2 bg-white border border-[#E8E3D8] rounded-xl px-3 py-1.5 text-xs text-[#18181B] shadow-2xs">
            <span className="text-[#71717A] font-mono text-[10px] uppercase font-bold">Event:</span>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="bg-transparent text-[#18181B] text-xs font-semibold focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              <option value="all" className="bg-white text-[#18181B]">
                All Hackathon Events (Global)
              </option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id} className="bg-white text-[#18181B]">
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
            className="font-mono text-xs"
          >
            Refresh Rankings
          </Button>
        </div>
      </div>

      {/* Interactive UI Controls & Toggles Bar */}
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-[#E8E3D8] shadow-2xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#71717A] pointer-events-none" />
          <input
            type="text"
            placeholder="Search ranked projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E8E3D8] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#18181B] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* UI Toggle 1: Podium Showcase */}
          <Toggle
            checked={showPodium}
            onChange={setShowPodium}
            size="sm"
            variant="default"
            label="Podium Highlights"
          />

          {/* UI Toggle 2: Score Breakdown */}
          <Toggle
            checked={showDetailedScores}
            onChange={setShowDetailedScores}
            size="sm"
            variant="default"
            label="70/30 Split Details"
          />
        </div>
      </div>

      {/* Podium Cards for Top 3 (if at least 3 entries exist) */}
      {showPodium && entries.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* #2 Silver */}
          <div className="order-2 md:order-1 nude-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-[#18181B] flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[#52525B]">
                  RANK #2
                </span>
              </div>
              <h3 className="text-base font-bold text-[#18181B]">{entries[1].project_name}</h3>
              <p className="text-xs text-[#71717A] mt-1 font-mono">Rank #2 in tournament standings</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between items-end font-mono">
              <span className="text-xs text-[#71717A]">Final Score</span>
              <span className="text-xl font-bold text-[#18181B]">
                {entries[1].final_score} <span className="text-xs font-normal text-[#71717A]">/ 100</span>
              </span>
            </div>
          </div>

          {/* #1 Winner */}
          <div className="order-1 md:order-2 nude-card p-6 rounded-2xl flex flex-col justify-between border-[#B5D7B7] bg-white shadow-md ring-1 ring-[#D8EAD9]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-[#D8EAD9] border border-[#B5D7B7] text-[#2D5A36] flex items-center justify-center text-sm font-mono font-black">
                  1
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D8EAD9] text-[#2D5A36]">
                  TOURNAMENT WINNER
                </span>
              </div>
              <h3 className="text-lg font-black text-[#18181B]">{entries[0].project_name}</h3>
              <p className="text-xs text-[#71717A] mt-1 font-mono">Grand Tournament Champion</p>
            </div>

            <div className="mt-4 flex justify-between items-end font-mono p-3.5 bg-[#D8EAD9]/40 border border-[#B5D7B7] rounded-xl">
              <span className="text-xs text-[#2D5A36] font-bold">Final Composite</span>
              <span className="text-2xl font-black text-[#2D5A36]">
                {entries[0].final_score} <span className="text-xs font-normal text-[#2D5A36]/70">/ 100</span>
              </span>
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="order-3 nude-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-[#18181B] flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[#52525B]">
                  RANK #3
                </span>
              </div>
              <h3 className="text-base font-bold text-[#18181B]">{entries[2].project_name}</h3>
              <p className="text-xs text-[#71717A] mt-1 font-mono">Rank #3 in tournament standings</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between items-end font-mono">
              <span className="text-xs text-[#71717A]">Final Score</span>
              <span className="text-xl font-bold text-[#18181B]">
                {entries[2].final_score} <span className="text-xs font-normal text-[#71717A]">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#71717A]">
          <Activity className="w-6 h-6 animate-spin mb-3 text-[#18181B]" />
          <p className="text-xs font-mono">Loading rankings...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#E8E3D8] bg-white">
          <Trophy className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
          <h4 className="text-xs font-bold text-[#18181B]">
            {searchQuery ? "No matching projects" : "No finalized results for this hackathon yet"}
          </h4>
          <p className="text-[11px] text-[#71717A] mt-1 max-w-xs mx-auto mb-4">
            {searchQuery
              ? "Try another search keyword or clear filter."
              : "Projects appear here once evaluations are completed and composite scores are calculated."}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setSelectedHackathon("all")} className="font-mono">
            View All Events Leaderboard
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E8E3D8] bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[#71717A] font-mono uppercase text-[10px]">
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
            <tbody className="divide-y divide-[#E8E3D8] font-mono">
              {filteredEntries.map((item) => (
                <tr
                  key={item.project_id}
                  className="hover:bg-[#FAF8F5] transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#18181B]">
                    {item.rank === 1 ? (
                      <span className="text-[#2D5A36] font-black">#01</span>
                    ) : item.rank === 2 ? (
                      <span className="text-[#18181B] font-bold">#02</span>
                    ) : item.rank === 3 ? (
                      <span className="text-[#3A4B86] font-bold">#03</span>
                    ) : (
                      `#${String(item.rank).padStart(2, "0")}`
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-[#18181B]">
                    <div>
                      <span>{item.project_name}</span>
                    </div>
                  </td>
                  {showDetailedScores && (
                    <>
                      <td className="py-3.5 px-4 text-right text-[#2D5A36] font-bold">
                        {item.ai_score}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#3A4B86] font-bold">
                        {item.human_score}
                      </td>
                    </>
                  )}
                  <td className="py-3.5 px-4 text-right font-bold text-[#18181B] text-sm">
                    {item.final_score}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/projects/${item.project_id}/evaluation`}
                      className="inline-flex items-center gap-1 text-[11px] text-[#71717A] hover:text-[#18181B] transition-colors font-sans font-semibold"
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
