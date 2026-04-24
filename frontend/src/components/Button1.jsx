"use client";
import { useRef, useState } from "react";
import { FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

const TARGET_TEXT = "View";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

const Button1 = ({ onClick }) => { // Accept onClick prop
  const intervalRef = useRef(null);
  const [text, setText] = useState(TARGET_TEXT);

  const scramble = () => {
    let pos = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setText(scrambled);
      pos++;
      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) stopScramble();
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);
    setText(TARGET_TEXT);
  };

  return (
    <motion.button
      onClick={onClick} // This triggers handleOpenModal in JobFeed
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      className="group relative overflow-hidden rounded-lg border border-emerald-500/30 bg-neutral-900 px-4 py-1.5 text-sm font-mono font-medium uppercase text-emerald-500/80 transition-colors hover:text-emerald-400 hover:border-emerald-500/60"
    >
      <div className="relative z-10 flex items-center gap-2">
        <FiLock className="text-xs" /> 
        <span>{text}</span>
      </div>
      <motion.span
        initial={{ y: "100%" }}
        animate={{ y: "-100%" }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.2, ease: "linear" }}
        className="absolute inset-0 z-0 scale-125 bg-gradient-to-t from-emerald-400/0 from-40% via-emerald-400/40 to-emerald-400/0 to-60% opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </motion.button>
  );
};

export default Button1;