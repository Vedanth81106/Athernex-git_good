export const applyStrip2 = (elements) => {
  return elements.filter(el => {
    const style = window.getComputedStyle(el);

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      style.fontSize === '0px'
    ) return false;

    if (style.display === 'contents') return true;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;

    return true;
  });
};