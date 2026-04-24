import { INTERACTIVE_WHITELIST } from '../utils/interactive.js';

export const applyStrip8 = (elements) => {
  return elements.filter(el => {
    if (el._depth === undefined) {
      let depth = 0;
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        depth++;
        parent = parent.parentElement;
      }
      el._depth = depth;
    }

    if (el._depth > 12) {
      const hasText = el.innerText?.trim().length > 0;
      const hasAttributes = el.hasAttributes();
      const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName);

      if (!hasText && !hasAttributes && !isInteractive) return false;
    }

    return true;
  });
};