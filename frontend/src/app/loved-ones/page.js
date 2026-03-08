"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllProfiles } from "@/lib/api";

const STATUS_STYLES = {
  emerald: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  slate: {
    dot: "bg-slate-400",
    text: "text-slate-500 dark:text-slate-400",
  },
};

export default function LovedOnesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllProfiles().then((data) => {
      if (data) setProfiles(data);
      setLoading(false);
    });
  }, []);

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <Link href="/" className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Loved Ones</h1>
        <button className="flex items-center justify-center p-2 rounded-full bg-primary text-slate-900 transition-colors">
          <span className="material-symbols-outlined">person_add</span>
        </button>
      </header>

      <main className="flex-1 pb-8 w-full">
        {/* Search Bar */}
        <div className="px-4 py-4">
          <label className="flex flex-col w-full">
            <div className="flex w-full items-stretch rounded-xl h-12 bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center pl-4 text-slate-500">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full border-none bg-transparent focus:ring-0 text-base font-normal placeholder:text-slate-400 focus:outline-none"
                placeholder="Search loved ones"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Monitoring Section */}
        <div className="px-4 pb-2 pt-2">
          <h3 className="text-lg font-bold leading-tight tracking-tight mb-4">Currently Monitoring</h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              {search ? "No results found." : "No profiles available."}
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((profile) => {
                const statusStyle = STATUS_STYLES[profile.statusColor] || STATUS_STYLES.slate;
                return (
                  <Link
                    key={profile.id}
                    href={`/profile?id=${profile.id}`}
                    className="block cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-primary/10">
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                            <p className={`text-xs font-semibold uppercase tracking-wider ${statusStyle.text}`}>
                              {profile.status}
                            </p>
                          </div>
                          <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">
                            {profile.name}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {profile.relation}, {profile.ageNumber}
                          </p>
                        </div>
                        <button className="mt-4 flex items-center justify-center rounded-full h-9 px-6 bg-primary/20 text-slate-900 dark:text-primary text-sm font-bold transition-all hover:bg-primary/30 w-fit">
                          View Details
                        </button>
                      </div>
                      <div
                        className="w-28 h-28 bg-center bg-no-repeat bg-cover rounded-xl"
                        aria-label={`Portrait of ${profile.name}`}
                        style={{ backgroundImage: `url("${profile.image}")` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="px-4 py-8">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 p-6 text-slate-500 hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-bold">Add another loved one</span>
          </button>
        </div>
      </main>
    </>
  );
}
