import { INTERACTIVE_WHITELIST } from '../utils/interactive.js';
import { CONFIG } from '../../config/config.js';

export const applyStrip9 = (elements) => {
  const seenExact = new Set();

  const pass1 = elements.filter(el => {
    const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, ' ') || "";
    const depth = el._depth ?? 0;
    const signature = `${el.tagName}-${text}-${depth}`;

    if (seenExact.has(signature)) return false;
    seenExact.add(signature);
    return true;
  });

  const textFrequency = {};
  for (const el of pass1) {
    const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, ' ') || "";
    if (text) textFrequency[text] = (textFrequency[text] || 0) + 1;
  }

  const firstOccurrenceTracked = new Set();

  return pass1.filter(el => {
    const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, ' ') || "";
    const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName) || el.hasAttribute('onclick');

    if (isInteractive) return true;

    if (textFrequency[text] > CONFIG.DEDUP_FREQUENCY_THRESHOLD) {
      if (firstOccurrenceTracked.has(text)) return false;
      firstOccurrenceTracked.add(text);
      return true;
    }

    return true;
  });
};