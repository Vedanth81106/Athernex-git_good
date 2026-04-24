// strip 1 blocklists all technical, meta and binary tags that add zero value

const BLOCKLIST_TAGS = [
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 
  'SVG', 'CANVAS', 'PATH', 'IFRAME', 'VIDEO', 
  'AUDIO', 'SOURCE', 'TRACK', 'EMBED', 'OBJECT',
  'META', 'LINK'
];

const attachPseudoText = (el) => {
  const before = window.getComputedStyle(el, '::before').content;
  const after = window.getComputedStyle(el, '::after').content;
  const clean = (val) => (val && val !== 'none' && val !== '""') 
    ? val.replace(/^["']|["']$/g, '') 
    : '';
  const text = [clean(before), clean(after)].filter(Boolean).join(' ');
  if (text) el._pseudoText = text;
};

export const applyStrip1 = (elements) => {

  return elements.filter(el => {
    if (BLOCKLIST_TAGS.includes(el.tagName)) return false;
    attachPseudoText(el);
    return true;
  });
};