"use client";

import { useState } from "react";
import TranscriptModal from "./TranscriptModal";

export default function HistoryListView({ history, filter }) {
  const [selectedCall, setSelectedCall] = useState(null);

  const getFilteredHistory = () => {
    if (filter === "Flagged") return history.filter(item => item.flagged);
    if (filter === "This Week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return history.filter(item => new Date(item.timestamp) >= oneWeekAgo);
    }
    return history;
  };

  const filteredHistory = getFilteredHistory();

  return (
    <>
      <div className="px-4 space-y-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Recent Activity</h2>
        
        {history.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Loading call history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center p-8 text-slate-500">No calls found for this filter.</div>
        ) : (
          filteredHistory.map((call) => (
            <div key={call.id} className={`bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ${call.flagged ? "border-l-4 border-l-orange-400" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-full flex items-center justify-center ${call.flagged ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}>
                    <span className="material-symbols-outlined">{call.moodEmoji === "😊" || call.moodEmoji === "🤠" ? "sentiment_very_satisfied" : call.moodEmoji === "😐" ? "sentiment_neutral" : "sentiment_satisfied"}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{call.name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {call.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {call.flagged && <span className="material-symbols-outlined text-orange-400 text-sm">flag</span>}
                  <button 
                    onClick={() => setSelectedCall(call)}
                    className="flex shrink-0 items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                    title="View Transcript"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                  </button>
                </div>
              </div>
              <div className="bg-background-light dark:bg-slate-800 p-3 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  &quot;{call.summary}&quot;
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <TranscriptModal 
        isOpen={!!selectedCall} 
        onClose={() => setSelectedCall(null)} 
        transcript={selectedCall?.transcript}
        title={selectedCall?.title}
      />
    </>
  );
}
