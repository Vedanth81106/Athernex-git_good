"use client";
import { useState, useEffect } from "react";
import Particles from "@/components/Particles";
import AddButton from "@/components/AddButton";
import JobModal from "@/components/JobModal";
import JobFeed from "@/components/JobFeed";
import SystemStats from "@/components/SystemStats";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/jobs/");
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#030303] overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={150}
          particleColors={["#00c97a", "#b6ffd9"]}
          particleSize={2}
          className="h-full w-full"
          moveSpeed={2}
          interactive={true}
        />
      </div>

      <div className="relative z-10 p-10 lg:p-14 flex flex-col gap-10">
        <div className="flex justify-between items-start">
          <AddButton 
            onClick={() => setIsModalOpen(true)} 
            text="Add job" 
            color="#00c97a" 
            textColor="#b6ffd9" 
          />
        </div>

        <div className="w-full flex flex-col gap-6">
          <SystemStats jobs={jobs} color="#00c97a" />
          <JobFeed jobs={jobs} color="#00c97a" />
        </div>
      </div>

      {isModalOpen && (
        <JobModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          color="#00c97a" 
        />
      )}
    </main>
  );
}