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
} from "lucide-react";
import { FinalizationAPI } from "@/lib/api/finalization";
import { LeaderboardEntry } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LeaderboardPage() {
  const { error } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await FinalizationAPI.getLeaderboard();
      setEntries(data || []);
    } catch (err: any) {
      error(err.message || "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredEntries = entries.filter((e) =>
    e.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Hackathon Leaderboard
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Rankings calibrated by the composite formula:{" "}
            <span className="font-mono text-zinc-200 font-semibold">
              Final = 70% AI Score + 30% Human Judge Score
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaderboard}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Rankings
          </Button>
        </div>
      </div>

      {/* Podium Cards for Top 3 (if at least 3 entries exist) */}
      {entries.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          {/* #2 Silver */}
          <Card className="order-2 md:order-1 flex flex-col justify-between p-5 bg-zinc-900/40 border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-zinc-400/10 border border-zinc-400/30 text-zinc-300 flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              <Badge variant="outline" size="sm">SILVER</Badge>
            </div>
            <h3 className="text-base font-bold text-zinc-100">{entries[1].project_name}</h3>
            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-end font-mono">
              <span className="text-xs text-zinc-500">Final Score</span>
              <span className="text-xl font-bold text-zinc-200">{entries[1].final_score}</span>
            </div>
          </Card>

          {/* #1 Gold */}
          <Card variant="elevated" className="order-1 md:order-2 flex flex-col justify-between p-6 bg-zinc-950 border-amber-500/30 shadow-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-sm font-mono font-black">
                1
              </span>
              <Badge variant="warning" size="sm">WINNER • GOLD</Badge>
            </div>
            <h3 className="text-lg font-bold text-zinc-100">{entries[0].project_name}</h3>
            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-end font-mono">
              <span className="text-xs text-zinc-500">Final Score</span>
              <span className="text-2xl font-black text-amber-400">{entries[0].final_score}</span>
            </div>
          </Card>

          {/* #3 Bronze */}
          <Card className="order-3 flex flex-col justify-between p-5 bg-zinc-900/40 border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-600 flex items-center justify-center text-xs font-mono font-bold">
                3
              </span>
              <Badge variant="outline" size="sm">BRONZE</Badge>
            </div>
            <h3 className="text-base font-bold text-zinc-100">{entries[2].project_name}</h3>
            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-end font-mono">
              <span className="text-xs text-zinc-500">Final Score</span>
              <span className="text-xl font-bold text-zinc-200">{entries[2].final_score}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="my-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leaderboard projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Activity className="w-6 h-6 animate-spin mb-3 text-zinc-400" />
          <p className="text-xs font-mono">Loading rankings...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-zinc-300">
            {searchQuery ? "No matching projects" : "No finalized results yet"}
          </h4>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? "Try another search keyword."
              : "Projects will appear here once the admin triggers final score computation."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4 text-right">AI Score (70%)</th>
                <th className="py-3 px-4 text-right">Human Score (30%)</th>
                <th className="py-3 px-4 text-right">Final Score</th>
                <th className="py-3 px-4 text-right w-24">Action</th>
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
                    {item.project_name}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-400">
                    {item.ai_score}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-400">
                    {item.human_score}
                  </td>
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
