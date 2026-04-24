"use client";
import { useEffect, useState } from "react";

// 1. Accept jobId as a prop
export default function Selector({ jobId }) {
  const [selectors, setSelectors] = useState([]);
  const [healLogs, setHealLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [selRes, logRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/all_selectors/"),
          fetch("http://127.0.0.1:8000/heal_logs/")
        ]);
        const sData = await selRes.json();
        const lData = await logRes.json();
        
        // 2. FILTER: Only keep selectors that match the current jobId
        // and have a valid selector string
        const validSelectors = Array.isArray(sData) 
          ? sData.filter(s => s.job_id === jobId && s.selector && s.selector.trim() !== "") 
          : [];

        setSelectors(validSelectors);
        setHealLogs(Array.isArray(lData) ? lData : []);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    
    if (jobId) fetchData();
  }, [jobId]); // Re-run when jobId changes

  return (
    <div className="w-full h-80 bg-black rounded-xl border border-white/5 flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 gap-2">
        {selectors.length > 0 ? (
          selectors.map((s) => {
            // 3. LOGIC: Check if this specific instance required a heal
            const wasHealed = healLogs.some(log => log.job_id === s.job_id && log.intent === s.intent);

            return (
              <div 
                key={s.selector_id} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  wasHealed 
                  ? "border-emerald-500/30 bg-emerald-500/5" 
                  : "border-white/5 bg-white/[0.01]" 
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="font-mono text-[10px] text-zinc-600">#{s.selector_id}</span>
                  <div className="flex flex-col">
                    <span className={`font-mono text-sm uppercase ${wasHealed ? "text-emerald-400" : "text-zinc-200"}`}>
                      {s.intent}
                    </span>
                    {/* Verifying the Job ID matches the Modal ID */}
                    <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">
                       INSTANCE_BOUND: {s.job_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-1 rounded font-mono border ${
                    wasHealed 
                    ? "bg-black border-emerald-500/20 text-emerald-500" 
                    : "bg-black border-white/10 text-zinc-500"
                  }`}>
                    {wasHealed ? "HEALED" : "ORIGINAL"}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${wasHealed ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-700"}`}></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-xl">
             <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.3em]">
               No Valid Selectors for Instance #{jobId}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}