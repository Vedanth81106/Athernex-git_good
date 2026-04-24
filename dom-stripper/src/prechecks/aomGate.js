export const AOM_ATTRIBUTES = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'role',
  'alt',
  'title',
  'tabindex',
  'placeholder'
];

export const hasAOMData = (el) => {
  if (Array.from(el.attributes).some(attr => attr.name.startsWith('aria-'))) return true;
  return AOM_ATTRIBUTES.some(attr => el.hasAttribute(attr));
};

export const processAOMNode = (el) => {
  if (el.getAttribute('aria-hidden') === 'true') {
    el.dataset.stripSkip = "true";
    return null;
  }

  if (!hasAOMData(el)) return null;

  el.dataset.aomProtected = "true";

  const resolveId = (id) => id ? document.getElementById(id)?.innerText?.trim() ?? '' : '';

  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || '',
    ariaLabel: el.getAttribute('aria-label') || '',
    ariaDescription: resolveId(el.getAttribute('aria-describedby')),
    ariaLabelledBy: resolveId(el.getAttribute('aria-labelledby')),
    tabindex: el.getAttribute('tabindex') || '',
    alt: el.getAttribute('alt') || '',
    title: el.getAttribute('title') || '',
    placeholder: el.getAttribute('placeholder') || '',
    innerText: el.innerText?.trim() || '',
    isAOMNode: true
  };
};