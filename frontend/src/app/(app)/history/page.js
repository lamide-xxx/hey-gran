"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCallHistory } from "@/lib/api";
import HistoryListView from "./HistoryListView";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Initial fetch
    fetchCallHistory().then(setHistory);
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
        fetchCallHistory().then(setHistory);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-primary/20">
        <Link href="/dashboard" className="p-2 hover:bg-primary/20 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Call History</h1>
        <button className="p-2 hover:bg-primary/20 rounded-full transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">search</span>
        </button>
      </header>

      <main className="flex-1 pb-8 w-full">
        {/* Filter Chips */}
        <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("All")}
            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 text-sm font-semibold shadow-sm ${filter === "All" ? "bg-primary text-slate-900" : "bg-primary/20 text-slate-800 dark:text-slate-200 border border-primary/30"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("Flagged")}
            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 text-sm font-semibold shadow-sm ${filter === "Flagged" ? "bg-primary text-slate-900" : "bg-primary/20 text-slate-800 dark:text-slate-200 border border-primary/30"}`}
          >
            Flagged
          </button>
          <button
            onClick={() => setFilter("This Week")}
            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 text-sm font-semibold shadow-sm ${filter === "This Week" ? "bg-primary text-slate-900" : "bg-primary/20 text-slate-800 dark:text-slate-200 border border-primary/30"}`}
          >
            This Week
          </button>
        </div>

        {/* Weekly Trends / Amber Alert Card */}
        <div className="px-4 mb-6">
          <div className="relative overflow-hidden rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Weekly Alert</span>
                  <span className="text-xs text-orange-500/80">Active</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Potential Health Trend</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  Dorothy reported feeling dizzy twice this week. We recommend checking in on her hydration levels.
                </p>
                <button className="w-full sm:w-auto bg-orange-600 dark:bg-orange-500 text-white text-sm font-bold py-2.5 px-6 rounded-full hover:bg-orange-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
            {/* Abstract visual element */}
            <div className="absolute -right-4 -bottom-4 size-24 bg-orange-400/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* History List Segment */}
        <HistoryListView history={history} filter={filter} />
        
      </main>
      <div className="hidden" data-location="Chicago"></div>
    </>
  );
}
