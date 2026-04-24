import { getResilientXPath } from '../utils/xpath.js';

export const emitNode = (el) => {
  const style = window.getComputedStyle(el);
  const resolveId = (id) => id ? document.getElementById(id)?.innerText?.trim() ?? '' : '';

  return {
    tag: el.tagName.toLowerCase(),
    innerText: el.innerText?.trim() || "",
    pseudoText: el._pseudoText || "",
    id: el.id || "",
    classes: Array.from(el.classList),
    dataAttributes: Object.fromEntries(
      Array.from(el.attributes)
        .filter(a => a.name.startsWith('data-'))
        .map(a => [a.name, a.value])
    ),
    role: el.getAttribute('role') || "",
    ariaLabel: el.getAttribute('aria-label') || "",
    ariaDescription: resolveId(el.getAttribute('aria-describedby')),
    ariaLabelledBy: resolveId(el.getAttribute('aria-labelledby')),
    tabindex: el.getAttribute('tabindex') || "",
    depth: el._depth || 0,
    zIndex: parseInt(style.zIndex) || 0,
    overlay: !!el._overlay,
    overlayWarning: el._overlayWarning || "",
    priority: el._priority || "low",
    xpath: getResilientXPath(el)
  };
};