"use client";
import { useEffect, useState } from "react";

export default function Logs({ jobId }) { // Added jobId prop
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/heal_logs/");
                if (!response.ok) return;
                const data = await response.json();
                
                // FILTER: Only show logs for the job we clicked on
                const filtered = Array.isArray(data) 
                    ? data.filter(log => log.job_id === jobId) 
                    : [];
                
                setLogs(filtered);
            } catch (error) {
                console.error("Fetch failed");
            }
        };
        if(jobId) fetchData(); // Only fetch if we have an ID
    }, [jobId]); // Re-fetch if user clicks a different job

    return (
        <div className="w-full h-80 bg-black rounded-xl border border-white/5 overflow-hidden flex flex-col">
            <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left font-mono text-[10px]">
                    <thead className="text-zinc-500 sticky top-0 bg-black border-b border-white/5 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-4">Job</th>
                            <th className="p-4">Intent</th>
                            <th className="p-4">New Selector</th>
                            <th className="p-4">Conf.</th>
                            <th className="p-4 text-right">Source</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-300 divide-y divide-white/5">
                        {logs.length > 0 ? (
                            logs.map((log, index) => (
                                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-zinc-500">#{log.job_id}</td>
                                    <td className="p-4 font-bold text-zinc-200">{log.intent}</td>
                                    <td className="p-4 text-emerald-400">
                                        <code className="bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                            {log.new_selector}
                                        </code>
                                    </td>
                                    <td className="p-4">{(log.confidence * 100).toFixed(0)}%</td>
                                    <td className="p-4 text-right">
                                        <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] text-zinc-400">
                                            {log.healed_by}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-20 text-center text-zinc-700 uppercase tracking-widest font-bold">
                                    No active healing logs for Job #{jobId}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}