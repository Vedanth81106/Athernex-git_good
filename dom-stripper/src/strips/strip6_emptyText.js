import { INTERACTIVE_WHITELIST } from '../utils/interactive.js';

/**
 * Strip 6: Empty Text Filter
 * Drops a node only if it has no text, no pseudo-text, 
 * is not interactive, and has no click handler.
 */
export const applyStrip6 = (elements) => {
  return elements.filter(el => {
    const text = el.innerText?.trim() || "";
    const pseudoText = el._pseudoText || ""; // captured in Strip 1
    const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName);
    const hasOnclick = el.hasAttribute('onclick');
    const hasAnchor = el.id || 
      Array.from(el.attributes).some(a => 
        a.name.startsWith('data-') || 
        a.name.startsWith('aria-') || 
        a.name === 'role'
      );// without hasAnchor, empty <td id="price-cell"> or <div data-testid="container"> 
      // get dropped even though they're valid selector targets.

    // ALL of these must be true to drop the node:
    const hasNoText = text === "" && pseudoText === "";
    
    if (hasNoText && !isInteractive && !hasOnclick && !hasAnchor) {
      return false; // drop empty wrapper
    }

    return true; // keep real data or interactive elements
  });
};