"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProfile, updateProfilePhone } from "@/lib/api";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || "dorothy";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState("");

  // UK phone: +44 followed by exactly 10 digits (13 chars total)
  const isValidUKPhone = (num) => /^\+44\d{10}$/.test(num);
  const phoneHint = !phoneNumber
    ? "Add a phone number above to trigger a call"
    : !isValidUKPhone(phoneNumber)
      ? "Please enter a valid UK number (+44 followed by 10 digits)"
      : "";
  const phoneError = phoneNumber && !isValidUKPhone(phoneNumber)
    ? "Please enter a valid UK phone number"
    : "";

  // Load profile from backend
  useEffect(() => {
    setLoading(true);
    fetchProfile(rawId).then((data) => {
      if (data) {
        setProfile(data);
        setPhoneNumber(data.phone || "");
      }
      setLoading(false);
    });
  }, [rawId]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  }, []);

  // Save phone number to backend when user clicks the checkmark
  const handleSavePhone = async () => {
    setIsSavingPhone(true);
    const updated = await updateProfilePhone(rawId, phoneNumber);
    if (updated) {
      setProfile(updated);
    }
    setIsSavingPhone(false);
    setIsEditingPhone(false);
  };

  const handleTriggerCall = async () => {
    if (!isValidUKPhone(phoneNumber)) return;
    setIsSubmitting(true);
    setFeedback("Calling user...");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/trigger-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, profile_id: rawId }),
      });
      if (res.ok) {
        setFeedback("✅ AI Check-In Triggered Successfully!");
      } else {
        let detail = "Unable to start the call right now. Please try again.";
        try {
          const body = await res.json();
          detail = body.detail || detail;
        } catch (_) { }
        console.error("Trigger call error:", detail);
        setFeedback("");
        showToast("Unable to start the call right now. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFeedback("");
      showToast("Unable to start the call right now. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(""), 8000);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20 p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            <Link href="/loved-ones" className="p-2 hover:bg-primary/20 rounded-full transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="w-10" />
          </div>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full pb-8 px-4 pt-8 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </main>
      </>
    );
  }

  // ── Profile not found ─────────────────────────────────────────────────────
  if (!profile) {
    return (
      <>
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20 p-4">
          <Link href="/loved-ones" className="p-2 hover:bg-primary/20 rounded-full transition-colors inline-flex">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">person_off</span>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Profile not found</p>
          <p className="text-sm text-slate-400">Could not load profile data. Check that the backend is running.</p>
          <Link href="/loved-ones" className="mt-2 px-6 py-2 bg-primary text-slate-900 font-bold rounded-full">
            Back to Loved Ones
          </Link>
        </main>
      </>
    );
  }

  // ── Full profile ──────────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <Link href="/loved-ones" className="p-2 hover:bg-primary/20 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{profile.firstName}&apos;s Profile</h1>
          <button className="p-2 hover:bg-primary/20 rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-8">
        {/* Profile Header */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full border-4 border-primary bg-cover bg-center shadow-lg"
              aria-label={`Portrait of ${profile.name}`}
              style={{ backgroundImage: `url("${profile.image}")` }}
            />
            <div className="absolute bottom-1 right-1 bg-primary p-1.5 rounded-full shadow-md">
              <span className="material-symbols-outlined text-xs text-slate-900">edit</span>
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{profile.age}</p>

          {/* Phone field */}
          <div className="flex flex-col items-center mt-2">
            <div className="flex items-center gap-2">
              {isEditingPhone ? (
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-transparent border-b border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none text-center w-44"
                  placeholder="+447700900000"
                  autoFocus
                />
              ) : phoneNumber ? (
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">{phoneNumber}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic">Enter phone number</p>
              )}
              <button
                onClick={isEditingPhone ? handleSavePhone : () => setIsEditingPhone(true)}
                disabled={isSavingPhone}
                className="p-1 rounded-full hover:bg-primary/20 text-slate-500 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {isSavingPhone ? "hourglass_empty" : isEditingPhone ? "check" : "edit"}
                </span>
              </button>
            </div>
            {phoneError && (
              <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>
            )}
          </div>
        </div>

        {/* Call Schedule Card */}
        <div className="mx-4 mb-6 p-4 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full">
              <span className="material-symbols-outlined text-slate-900 filled-icon">call</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Daily Call Schedule</p>
              <p className="text-lg font-bold">10:00 AM</p>
            </div>
          </div>
          <button className="text-sm font-bold text-slate-900 bg-primary px-4 py-2 rounded-full shadow-sm">Remind Me</button>
        </div>

        {/* Trigger AI Check-In */}
        <div className="mx-4 mb-6">
          <button
            onClick={handleTriggerCall}
            disabled={isSubmitting || !!phoneError || !phoneNumber}
            className="w-full flex items-center justify-center gap-2 bg-primary text-slate-900 font-bold py-3 px-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">robot_2</span>
            {isSubmitting ? "Calling user..." : "Trigger AI Check-In"}
          </button>
          {feedback && (
            <p className="text-center text-sm font-medium mt-2 text-green-600 dark:text-green-400">{feedback}</p>
          )}
          {!feedback && phoneHint && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              {phoneHint}
            </p>
          )}
        </div>

        {/* Sections Grid */}
        <div className="px-4 space-y-8">

          {/* Interests & Personality */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary filled-icon">favorite</span>
              <h3 className="text-lg font-bold">Interests &amp; Personality</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.interests || []).map((interest) => (
                <span key={interest} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </section>

          {/* Health Conditions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary filled-icon">medical_information</span>
              <h3 className="text-lg font-bold">Health Conditions</h3>
            </div>
            <div className="space-y-2">
              {(profile.conditions || []).map((cond) => (
                <div key={cond.name} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-primary/10">
                  <span className="material-symbols-outlined text-red-400">emergency</span>
                  <div>
                    <p className="font-bold text-sm">{cond.name}</p>
                    <p className="text-xs text-slate-500">{cond.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Medications */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary filled-icon">pill</span>
              <h3 className="text-lg font-bold">Medications</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(profile.meds || []).map((med) => (
                <div key={med.name} className="p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-primary/10">
                  <p className="font-bold text-sm">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Choose interests for next calls */}
          <section className="p-5 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              <h3 className="text-lg font-bold leading-tight">Choose interests for next 2-3 calls</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary text-slate-900 rounded-full text-sm font-bold flex items-center gap-1">
                Grandkids <span className="material-symbols-outlined text-sm">check</span>
              </button>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 rounded-full text-sm font-medium hover:border-primary transition-colors">Weather</button>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 rounded-full text-sm font-medium hover:border-primary transition-colors">New Recipe</button>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 rounded-full text-sm font-medium hover:border-primary transition-colors">Local News</button>
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 rounded-full text-sm font-medium hover:border-primary transition-colors">Book Club</button>
            </div>
          </section>
        </div>
      </main>

      {/* Toast notification for API errors */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
            <span className="material-symbols-outlined text-orange-400 shrink-0">warning</span>
            <p>{toast}</p>
            <button onClick={() => setToast("")} className="ml-auto shrink-0 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
