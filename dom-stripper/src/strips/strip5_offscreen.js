/**
 * Strip 5: Off-screen Filter
 * Drops elements that are fully outside the viewport by more than 500px.
 */

import { CONFIG } from '../../config/config.js';

export const applyStrip5 = (elements) => {
  const vWidth = window.innerWidth;
  const vHeight = window.innerHeight;
  const BUFFER = CONFIG.OFFSCREEN_BUFFER; // the safety zone for SPA/Pre-rendered content

  return elements.filter(el => {
    const rect = el.getBoundingClientRect();

    // check if the element is fully outside the buffer zone in ANY direction
    const isWayOff = (
      rect.bottom < -BUFFER || 
      rect.top > vHeight + BUFFER || 
      rect.right < -BUFFER || 
      rect.left > vWidth + BUFFER
    );

    if (isWayOff) {
      const style = window.getComputedStyle(el);
      // safety: Sticky and Fixed elements stay regardless of their math coordinates
      if (style.position === 'fixed' || style.position === 'sticky') {
        return true;
      }
      return false;
    }

    return true;
  });
};