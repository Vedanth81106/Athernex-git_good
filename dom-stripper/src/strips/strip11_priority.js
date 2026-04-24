const PRIORITY_MAP = {
  CRITICAL: ['H1', 'H2', 'H3', 'LABEL', 'CAPTION', 'FIGCAPTION'],
  HIGH:     ['H4', 'H5', 'H6', 'P', 'LI', 'DT', 'DD'],
  MEDIUM:   ['TD', 'TH', 'BLOCKQUOTE', 'PRE', 'CODE', 'A'],
  LOW:      ['DIV', 'SECTION', 'ARTICLE', 'SPAN', 'HEADER', 'FOOTER']
};

const INTERACTIVE_TAGS = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

export const applyStrip11 = (elements) => {
  return elements.map(el => {
    let priority = 'low';
    const tag = el.tagName;

    if (PRIORITY_MAP.CRITICAL.includes(tag)) priority = 'critical';
    else if (PRIORITY_MAP.HIGH.includes(tag)) priority = 'high';
    else if (PRIORITY_MAP.MEDIUM.includes(tag)) priority = 'medium';

    const isInteractive = INTERACTIVE_TAGS.includes(tag) || el.hasAttribute('onclick');
    if (isInteractive) priority = 'critical';

    const zIndex = parseInt(window.getComputedStyle(el).zIndex);
    if (!isNaN(zIndex) && zIndex > 10 && zIndex <= 100) {
      if (priority === 'low') priority = 'medium';
      else if (priority === 'medium') priority = 'high';
      else if (priority === 'high') priority = 'critical';
    }

    el._priority = priority;
    return el;
  });
};