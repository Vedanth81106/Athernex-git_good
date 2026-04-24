import { CONFIG } from '../../config/config.js';

export const applyStrip10 = (elements) => {
  const vWidth = window.innerWidth;
  const vHeight = window.innerHeight;
  const viewportArea = vWidth * vHeight;

  return elements.map(el => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex);
    const rect = el.getBoundingClientRect();
    const elementArea = rect.width * rect.height;
    const isFixed = style.position === 'fixed' || style.position === 'sticky';

    if ((!isNaN(zIndex) && zIndex > CONFIG.OVERLAY_Z_INDEX_THRESHOLD) || isFixed) {
      if (elementArea > viewportArea * CONFIG.OVERLAY_VIEWPORT_COVERAGE) {
        el._overlay = true;
        el._overlayWarning = `Covers >50% of viewport at z-index ${zIndex}. Handle before proceeding.`;
      }
    }

    return el;
  });
};