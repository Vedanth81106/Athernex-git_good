export const getResilientXPath = (el) => {
  if (!(el instanceof Element)) return '';

  if (el.id) return `//*[@id="${el.id}"]`;

  const goldenAttrs = ['data-testid', 'data-cy', 'data-qa'];
  for (const attr of goldenAttrs) {
    if (el.hasAttribute(attr)) return `//*[@${attr}="${el.getAttribute(attr)}"]`;
  }

  const parts = [];
  let current = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.parentNode ? current.parentNode.firstChild : null;
    
    while (sibling) {
      if (sibling === current) break;
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.nextSibling;
    }

    const tagName = current.tagName.toLowerCase();

    if (current.id && current !== el) {
      parts.unshift(`*[@id="${current.id}"]`);
      break; 
    }

    parts.unshift(`${tagName}[${index}]`);

    if (current.tagName === 'BODY') {
        parts.unshift('html[1]');
        break;
    }

    current = current.parentNode;
  }

  const fullPath = parts.join('/');
  return fullPath.startsWith('*') ? `//${fullPath}` : `/${fullPath}`;
};