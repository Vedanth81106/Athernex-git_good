"use client";

import { useEffect, useState } from "react";

export default function JobFeed({color}){

    const [jobs, setJobs] = useState([]);

    const fetchJobs = async() => {

        try{
            // someone pls add jobs endpoint here to fetch all jobs

            const response = await fetch("http://127.0.0.1:8000/jobs/");
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : [data]);
        }catch(error){
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
        const timer = setInterval(fetchJobs, 3000); // 3 seconds
        return() => clearInterval(timer);
    },[]);

    return (
    <div className="mt-12 space-y-3 w-full max-w-4xl">
      <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4 ml-1">Active Instances</h3>
      
      {jobs.map((job) => (
        <div 
          key={job.job_id} 
          className="group flex items-center justify-between p-5 bg-[#0a0f0c] border border-white/5 rounded-2xl transition-all hover:border-white/10"
        >
          <div className="flex flex-col gap-1">
            <span className="text-white text-sm font-medium tracking-tight">
              {job.target_url}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono italic">
              {job.script}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span 
              className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter"
              style={{ 
                backgroundColor: job.status === 'healed' ? `${color}15` : '#27272a',
                color: job.status === 'healed' ? color : '#71717a'
              }}
            >
              {job.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}