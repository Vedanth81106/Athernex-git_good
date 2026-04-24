export const applyStrip3 = (elements) => {
  const vWidth = window.innerWidth;
  const vHeight = window.innerHeight;

  return elements.filter(el => {
    const style = window.getComputedStyle(el);
    const position = style.position;

    if (position !== 'absolute' && position !== 'fixed') return true;

    const left = parseFloat(style.left);
    const top = parseFloat(style.top);

    if (!isNaN(left) && left < -vWidth) return false;
    if (!isNaN(top) && top < -vHeight) return false;

    if (style.clip === 'rect(0px, 0px, 0px, 0px)' ||
        style.clip === 'rect(0, 0, 0, 0)') return false;

    if (style.clipPath === 'inset(100%)' ||
        style.clipPath === 'inset(50%)') return false;

    return true;
  });
};