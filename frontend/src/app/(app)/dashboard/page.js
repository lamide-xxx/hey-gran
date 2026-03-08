"use client";

import React, { useEffect, useState } from "react";
import { fetchCallHistory } from "@/lib/api";
import Link from "next/link";
import TranscriptModal from "../history/TranscriptModal";


export default function Home() {
  const [latestCall, setLatestCall] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCall, setIsNewCall] = useState(false);
  const latestCallIdRef = React.useRef(null);

  useEffect(() => {
    const loadHistory = () => {
      fetchCallHistory().then(history => {
        if (history && history.length > 0) {
          const newest = history[0];
          if (latestCallIdRef.current && latestCallIdRef.current !== newest.id) {
            // A new call appeared — trigger animation
            setIsNewCall(true);
            setTimeout(() => setIsNewCall(false), 1200);
          }
          latestCallIdRef.current = newest.id;
          setLatestCall(newest);
        }
      });
    };

    loadHistory();
    const interval = setInterval(loadHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header / Top Greeting */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-6 justify-between sticky top-0 z-10 w-full max-w-md mx-auto">
        <div className="flex size-12 shrink-0 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary" aria-label="Profile picture of Tami" style={{ backgroundImage: 'url("/images/tami.jpg")' }}></div>
        </div>
        <div className="flex-1 px-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monday, Oct 24</p>
          <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Good morning, Tami!</h2>
        </div>
        <div className="flex w-12 items-center justify-end">
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary/20 text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 space-y-6 flex-1 w-full pb-8">
        {/* Urgent Alert Section */}
        <div className="@container">
          <div className="flex flex-col gap-4 rounded-xl border border-primary/50 bg-primary/10 p-5">
            <div className="flex items-start gap-3">
              <div className="bg-primary p-2 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-900">warning</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight">Attention Needed</p>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-normal leading-normal">Dorothy mentioned slight chest pain during the last call. Please follow up.</p>
              </div>
            </div>
            <button className="w-full flex cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-primary text-slate-900 text-sm font-bold shadow-sm">
              <span className="material-symbols-outlined mr-2 text-lg">call</span>
              <span>Call Dorothy</span>
            </button>
          </div>
        </div>

        {/* Main Focus: Today's Call Summary */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Latest Call Summary</h3>
            <Link href="/history" className="text-primary font-semibold text-sm hover:underline">See All</Link>
          </div>
          <div className={`flex flex-col overflow-hidden rounded-xl shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-500 ${isNewCall ? "ring-2 ring-primary scale-[1.01]" : ""}`}>
            {latestCall?.name === "Uncle Arthur" ? (
              <div className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover" aria-label="Arthur smiling" style={{ backgroundImage: 'url("/images/arthur.jpg")' }}></div>
            ) : (
              <div className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover" aria-label="Elderly woman smiling in her garden with flowers" style={{ backgroundImage: 'url("/images/dorothy.jpg")' }}></div>
            )}

            <div className="flex flex-col p-4 gap-3 relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">{latestCall ? latestCall.title : "Loading..."}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{latestCall ? `${latestCall.duration} • Mood: ${latestCall.moodEmoji} ${latestCall.mood}` : "..."}</p>
                </div>
                {latestCall && <span className="bg-primary/20 text-slate-900 dark:text-slate-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Completed</span>}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {latestCall ? latestCall.summary : "Fetching latest call summary..."}
              </p>
              <button
                onClick={() => latestCall && setIsModalOpen(true)}
                disabled={!latestCall}
                className="flex items-center justify-center gap-2 rounded-full h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">description</span>
                <span>View Transcript</span>
              </button>
            </div>
          </div>
        </section>

        {/* Medication Check Section */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Medication Check</h3>
            <span className="text-primary font-semibold text-sm">See Schedule</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2">
              <div className="size-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined">done_all</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold">Morning</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Taken at 8:15 AM</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2">
              <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold">Evening</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Due at 7:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mood Trend Section */}
        <section className="pb-6">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-3 px-1">7-Day Mood Trend</h3>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="relative flex items-end justify-between h-40 px-2 mt-4">
              {/* Grid lines for mood levels */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                <div className="border-b border-slate-100 dark:border-slate-700 w-full h-0"></div>
                <div className="border-b border-slate-100 dark:border-slate-700 w-full h-0"></div>
                <div className="border-b border-slate-100 dark:border-slate-700 w-full h-0"></div>
              </div>
              {/* Monday */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[70%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">😊</span>
                  <div className="w-0.5 h-16 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Mon</span>
              </div>
              {/* Tuesday */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[85%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">😊</span>
                  <div className="w-0.5 h-20 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Tue</span>
              </div>
              {/* Wednesday (Dip) */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[45%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">😐</span>
                  <div className="w-0.5 h-10 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Wed</span>
              </div>
              {/* Thursday (Recovering) */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[60%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">🙂</span>
                  <div className="w-0.5 h-14 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Thu</span>
              </div>
              {/* Friday */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[80%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">😊</span>
                  <div className="w-0.5 h-18 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Fri</span>
              </div>
              {/* Saturday */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[90%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">✨</span>
                  <div className="w-0.5 h-22 bg-primary/30 mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-400 font-bold uppercase bottom-1">Sat</span>
              </div>
              {/* Sunday */}
              <div className="relative flex flex-col items-center flex-1 h-full z-1">
                <div className="absolute bottom-[95%] transform translate-y-1/2 flex flex-col items-center">
                  <span className="text-xl">🌟</span>
                  <div className="w-0.5 h-24 bg-primary mt-1"></div>
                </div>
                <span className="absolute text-[10px] text-slate-900 dark:text-slate-100 font-bold uppercase bottom-1">Sun</span>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-slate-500 font-medium">
              Dorothy's mood is <span className="text-green-600 font-bold">15% better</span> than last week!
            </p>
          </div>
        </section>
      </main>

      <TranscriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transcript={latestCall?.transcript}
        title={latestCall?.title}
      />
    </>
  );
}
