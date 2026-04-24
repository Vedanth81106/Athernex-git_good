import React from 'react';

const StripConfigModal = ({ config, onChange, onClose, color, strips }) => {
  const allOn = Object.values(config).every(Boolean);

  const toggleAll = () => {
    const newState = !allOn;
    strips.forEach(s => onChange(s.key, newState));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div
        className="w-[85vw] max-w-4xl h-[85vh] bg-[#080d0a] border rounded-3xl shadow-2xl flex flex-col"
        style={{ borderColor: `${color}33` }}
      >
        <div className="px-10 pt-10 pb-6 border-b" style={{ borderColor: `${color}22` }}>
          <h2 className="text-2xl font-bold text-white">Configure DOM Strips</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">Kintsugi / Strip-Config</p>
        </div>

        <div className="overflow-y-auto flex-1 px-10 py-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-widest">
                <th className="text-left pb-4 font-normal w-12">On</th>
                <th className="text-left pb-4 font-normal pl-4">Strip Name</th>
                <th className="text-left pb-4 font-normal pl-4 hidden md:table-cell">Technical Description</th>
              </tr>
            </thead>
            <tbody>
              {strips.map((strip) => (
                <tr
                  key={strip.key}
                  className="border-t transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: '#ffffff08' }}
                >
                  <td className="py-6 align-top">
                    <button
                      onClick={() => onChange(strip.key, !config[strip.key])}
                      className="w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-1"
                      style={{
                        borderColor: config[strip.key] ? color : '#333',
                        backgroundColor: config[strip.key] ? `${color}22` : 'transparent',
                      }}
                    >
                      {config[strip.key] && (
                        <svg width="12" height="12" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="py-6 pl-4 align-top">
                    <div className="flex flex-col gap-2">
                      <span className={`font-mono text-sm ${config[strip.key] ? 'text-white' : 'text-zinc-600'}`}>
                        {strip.label}
                      </span>
                      {!strip.safe && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-red-900/50 bg-red-950/30 text-red-500 w-fit uppercase tracking-tighter">
                          Recommended to keep
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 pl-4 hidden md:table-cell align-top">
                    <span className="text-zinc-500 text-sm leading-relaxed">{strip.desc}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-10 py-8 border-t flex items-center justify-between bg-black/20" style={{ borderColor: `${color}22` }}>
          <button
            onClick={toggleAll}
            className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em] font-mono font-bold"
          >
            {allOn ? 'Disable All Passes' : 'Enable All Passes'}
          </button>
          <button
            onClick={onClose}
            className="px-12 py-3 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95 active:opacity-80"
            style={{ backgroundColor: color, color: '#000' }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripConfigModal;