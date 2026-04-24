import React from 'react';
import { HiOutlinePlus } from "react-icons/hi2";

const AddButton = ({ onClick, text, color = "#00c97a", textColor = "#b6ffd9" }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative w-[180px] h-[48px] cursor-pointer flex items-center border bg-[#0a0f0c] rounded-xl overflow-hidden transition-all duration-[150ms] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none outline-none"
      style={{ boxShadow: `3px 3px 0px ${color}`, borderColor: `${color}40` }}
    >
      <span
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full opacity-60 pointer-events-none transition-all duration-[1000ms] ease-in-out group-hover:right-[-10px] group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${color}59 0%, transparent 70%)` }}
      />

      <span
        className="relative z-10 pl-[18px] text-[13px] font-semibold tracking-[0.01em] transition-all duration-[1000ms] ease-in-out group-hover:opacity-0 group-hover:-translate-x-2"
        style={{ color: textColor }}
      >
        {text}
      </span>

      <span
        className="absolute right-0 z-10 h-full w-[46px] flex items-center justify-center border-l transition-all duration-[1000ms] ease-in-out group-hover:w-full group-hover:border-l-0 group-hover:bg-[#00c97a]"
        style={{ borderLeftColor: `${color}4D`, backgroundColor: 'transparent' }}
      >
        <HiOutlinePlus
          className="text-[18px] transition-all duration-[1000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:!text-white group-hover:scale-125 group-hover:rotate-90"
          style={{ color: color }}
        />
      </span>
    </button>
  );
};

export default AddButton;