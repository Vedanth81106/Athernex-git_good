import React, { useState } from 'react';
import axios from 'axios';
import StripConfigModal from './StripConfigModal';

const STRIPS = [
  { key: 'Blocklist',   label: 'Strip 1 — Tag Blocklist',        desc: 'Drops script, style, svg, canvas, iframe and other non-semantic tags.',         safe: false },
  { key: 'Visibility',  label: 'Strip 2 — Visibility Filter',    desc: 'Drops elements with display:none, visibility:hidden, or opacity:0.',            safe: false },
  { key: 'Positional',  label: 'Strip 3 — Positional Hiding',    desc: 'Drops absolutely-positioned elements pushed off-screen (screen-reader traps).', safe: true  },
  { key: 'ZeroSize',    label: 'Strip 4 — Zero-size Filter',     desc: 'Drops elements with both width=0 and height=0.',                                safe: true  },
  { key: 'Offscreen',   label: 'Strip 5 — Off-screen Filter',    desc: 'Drops elements more than 500px outside the viewport.',                          safe: true  },
  { key: 'EmptyText',   label: 'Strip 6 — Empty Text Filter',    desc: 'Drops non-interactive nodes with no visible text or pseudo-content.',           safe: true  },
  { key: 'Collapse',    label: 'Strip 7 — Inline Collapse',      desc: 'Collapses attribute-less inline elements (span, em, b) into their parent.',     safe: true  },
  { key: 'DepthCap',    label: 'Strip 8 — Depth Cap',            desc: 'Drops anonymous deep wrapper divs with no content or attributes.',              safe: true  },
  { key: 'Dedup',       label: 'Strip 9 — Deduplication',        desc: 'Removes exact duplicate nodes and high-frequency repeated text.',               safe: true  },
  { key: 'Overlay',     label: 'Strip 10 — Overlay Detection',   desc: 'Flags high z-index elements covering >50% of viewport.',                        safe: true  },
  { key: 'Priority',    label: 'Strip 11 — Priority Tagging',    desc: 'Tags nodes by semantic priority and sorts output.',                             safe: true  },
];

const DEFAULT_CONFIG = Object.fromEntries(STRIPS.map(s => [s.key, true]));

const JobModal = ({ isOpen, onClose, color = "#00c97a" }) => {
  const [targeturl, settargeturl] = useState('');
  const [logic, setLogic] = useState('');
  const [isloading, setIsloading] = useState(false);
  const [stripConfig, setStripConfig] = useState(DEFAULT_CONFIG);
  const [showStripModal, setShowStripModal] = useState(false);

  if (!isOpen) return null;

  const disabledCount = Object.values(stripConfig).filter(v => !v).length;

  const handleStripChange = (key, val) => {
    setStripConfig(prev => ({ ...prev, [key]: val }));
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    setIsloading(true);
    try {
      const payload = { target_url: targeturl, script: logic, strip_config: stripConfig };
      await axios.post('http://localhost:8000/jobs/', payload);
      alert('Job Dispatched Successfully!');
      onClose();
    } catch (error) {
      console.error('Error Dispatching Job', error);
      alert('Failed to dispatch job');
    } finally {
      setIsloading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div
          className="w-[75vw] h-[80vh] bg-[#0a0f0c] border rounded-3xl p-10 pb-8 shadow-2xl flex flex-col"
          style={{ borderColor: `${color}33` }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create Automation Job</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">Kintsugi / Task-Dispatcher</p>
          </div>

          <form className="flex-1 flex flex-col space-y-5" onSubmit={handlesubmit}>
            {/* Reduced Input Height */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2 ml-1">Target URL</label>
              <input
                type="text" required value={targeturl}
                onChange={(e) => settargeturl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-base text-white outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Expanded Script Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2 ml-1">Script</label>
              <textarea
                required value={logic}
                onChange={(e) => setLogic(e.target.value)}
                placeholder="Paste Playwright script here"
                className="flex-1 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-sm font-mono text-zinc-300 outline-none focus:border-zinc-400 transition-colors resize-none overflow-y-auto"
              />
            </div>

            {/* Slimmer Config Button */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-2.5 border cursor-pointer transition-colors hover:border-zinc-500"
              style={{ borderColor: '#ffffff10', backgroundColor: '#ffffff05' }}
              onClick={() => setShowStripModal(true)}
            >
              <div>
                <p className="text-[11px] text-zinc-300 font-mono">DOM Strip Configuration</p>
                <p className="text-[9px] text-zinc-600">
                  {disabledCount === 0 ? 'All 11 strips enabled' : `${disabledCount} strips disabled`}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-500">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Smaller Action Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button" onClick={onClose}
                className="px-6 py-2 text-[11px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isloading}
                className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg"
                style={{ backgroundColor: color, color: '#000' }}
              >
                {isloading ? 'Dispatching...' : 'Dispatch Job'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showStripModal && (
        <StripConfigModal
          config={stripConfig}
          onChange={handleStripChange}
          onClose={() => setShowStripModal(false)}
          color={color}
          strips={STRIPS}
        />
      )}
    </>
  );
};

export default JobModal;