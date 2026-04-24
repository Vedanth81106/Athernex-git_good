"use client";

import { useEffect, useState } from "react";
import Button1 from "@/components/Button1";
import Modal from "@/components/Modal"; 

export default function JobFeed({color}){
    const [jobs, setJobs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // NEW: Track which job is being viewed
    const [selectedJobId, setSelectedJobId] = useState(null);

    const fetchJobs = async() => {
        try{
            const response = await fetch("http://127.0.0.1:8000/jobs/");
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : [data]);
        }catch(error){
            console.error("Error fetching jobs:", error);
        }
    };
    useEffect(() => {
        fetchJobs();
        const timer = setInterval(fetchJobs, 3000);
        return() => clearInterval(timer);
    },[]);

    const getStatusStyles = (status) => {
      switch(status) {
        case 'queued': return { bg: '#3b82f620', text: '#3b82f6' };
        case 'running': return { bg: '#eab30820', text: '#eab308' };
        case 'healing': return { bg: '#f9731620', text: '#f97316' };
        case 'healed': return { bg: `${color}20`, text: color };
        case 'done': return { bg: '#22c55e20', text: '#22c55e' };
        case 'failed': return { bg: '#ef444420', text: '#ef4444' };
        default: return { bg: '#27272a', text: '#71717a' };
      }
    };

    return (
    <div className="mt-12 space-y-3 w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4 ml-1">
        <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Active Instances</h3>
        <span className="text-[10px] text-zinc-600 font-mono">Count: {jobs.length}</span>
      </div>
      
      {jobs.map((job) => {
        const styles = getStatusStyles(job.status);
        return (
          <div 
            key={job.job_id} 
            className="group flex items-center justify-between p-6 bg-[#0a0f0c] border border-white/5 rounded-2xl transition-all hover:border-white/10 hover:bg-[#0d1410]"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: styles.text }}></div>
                <span className="text-white text-base font-semibold tracking-tight">
                  {job.target_url}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Instance ID:</span>
                <span className="text-[10px] text-zinc-400 font-mono">#{job.job_id}</span>
              </div>
            </div>

            {/* UPDATED: Pass the specific job_id to the open function */}
            <Button1 onClick={() => {
                setSelectedJobId(job.job_id);
                setIsModalOpen(true);
            }} />

            <div className="flex flex-col items-end">
              <span 
                className="text-[11px] px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.15em] border transition-all"
                style={{ 
                  backgroundColor: styles.bg,
                  color: styles.text,
                  borderColor: `${styles.text}33`
                }}
              >
                {job.status}
              </span>
            </div>
          </div>
        );
      })}

      {/* NEW: Passing selectedJobId to Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        jobId={selectedJobId}
      />
    </div>
  );
}