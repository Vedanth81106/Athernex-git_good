import React from 'react';

const SystemStats = ({ jobs = [], color = "#00c97a" }) => {
  const stats = {
    total: jobs.length,
    healed: jobs.filter(j => j.status === 'healed').length,
    active: jobs.filter(j => j.status === 'healing' || j.status === 'queued').length
  };

  const Card = ({ label, value, highlight = false }) => (
    <div className="flex-1 p-4 bg-[#0a0f0c] border border-white/5 rounded-2xl">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold tracking-tighter ${highlight ? '' : 'text-white'}`}
         style={highlight ? { color: color } : {}}>
        {value.toString().padStart(2, '0')}
      </p>
    </div>
  );

  return (
    <div className="flex gap-4 w-full max-w-4xl mb-6">
      <Card label="Total Instances" value={stats.total} />
      <Card label="Self-Healed" value={stats.healed} highlight={true} />
      <Card label="Active Tasks" value={stats.active} />
    </div>
  );
};

export default SystemStats;