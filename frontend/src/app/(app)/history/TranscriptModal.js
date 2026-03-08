"use client";

export default function TranscriptModal({ isOpen, onClose, transcript, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-primary/20 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-primary/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title || "Call Transcript"}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {transcript ? (
            <div className="space-y-4">
              {transcript.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                const isAI = line.startsWith("AI:");
                return (
                  <div key={i} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      isAI 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700" 
                        : "bg-primary text-slate-900 rounded-tr-none font-medium shadow-sm"
                    }`}>
                      <p className="text-[13px] opacity-60 mb-1 font-bold tracking-wider uppercase">{isAI ? "Hey Gran AI" : line.split(':')[0]}</p>
                      <p className="text-sm leading-relaxed">{line.substring(line.indexOf(':') + 1).trim()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 italic py-8">No transcript available for this call.</p>
          )}
        </div>
        
        <div className="p-4 border-t border-primary/10 bg-slate-50 dark:bg-slate-800/50">
          <button 
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
