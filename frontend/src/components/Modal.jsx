"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logs from "./Logs";
import Selector from "./Selector";

// 1. Accept 'jobId' as a prop from the JobFeed
export default function Modal({ isOpen, onClose, jobId }) {
  const [activeTab, setActiveTab] = useState("logs");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* FULL SCREEN BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* MODAL BOX */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0a0f0c] border border-white/10 rounded-2xl p-6 shadow-2xl">
        
        {/* TOP BUTTONS */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border transition-all ${
              activeTab === "logs" 
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
              : "border-white/5 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Logs
          </button>
          <button 
            onClick={() => setActiveTab("selector")}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border transition-all ${
              activeTab === "selector" 
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
              : "border-white/5 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Selector
          </button>
        </div>

        {/* BLACK SCREEN AREA */}
        <div className="w-full">
          {/* 2. Pass the 'jobId' down to Logs and Selector */}
          {activeTab === "logs" ? (
            <Logs jobId={jobId} />
          ) : (
            <Selector jobId={jobId} />
          )}
        </div>

        {/* CLOSE ACTION */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-colors"
          >
            {/* 3. Added a dynamic label to help you verify which job you are looking at */}
            Close instance #{jobId} _
          </button>
        </div>
      </div>
    </div>
  );
}