import { INTERACTIVE_WHITELIST } from '../utils/interactive.js';

const COLLAPSIBLE_TAGS = ['span', 'em', 'strong', 'b', 'i', 'u', 'small', 'sup', 'sub', 'abbr', 'cite', 'mark'];

export const applyStrip7 = (elements) => {
  const survivingSet = new Set(elements);

  return elements.filter(el => {
    if (!COLLAPSIBLE_TAGS.includes(el.tagName.toLowerCase())) return true;
    if (INTERACTIVE_WHITELIST.includes(el.tagName)) return true;
    if (el.hasAttributes()) return true;

    const parent = el.parentElement;
    if (!parent || !survivingSet.has(parent)) return true;

    return false;
  });
};