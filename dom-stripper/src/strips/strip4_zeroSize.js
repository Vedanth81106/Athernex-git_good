export const applyStrip4 = (elements) => {
  return elements.filter(el => {
    if (window.getComputedStyle(el).display === 'contents') return true;
    const rect = el.getBoundingClientRect();
    return !(rect.width === 0 && rect.height === 0);
  });
};