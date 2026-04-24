export const INTERACTIVE_WHITELIST = [
  'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'DETAILS', 'SUMMARY'
];

const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'menuitem', 'tab', 
  'checkbox', 'radio', 'switch', 'option', 'textbox'
]);

export const isInteractive = (el) => {
  // check tag name - always interactive
  if (INTERACTIVE_WHITELIST.includes(el.tagName)) return true;

  // check aria role
  const role = el.getAttribute('role');
  if (role && INTERACTIVE_ROLES.has(role.toLowerCase())) return true;

  // check for event listeners
  if (el.hasAttribute('onclick') || el.hasAttribute('@click')) return true;

  // correct tabIndex check
  const tabIndexAttr = el.getAttribute('tabindex');
  if (tabIndexAttr !== null) {
    const tabIndexValue = parseInt(tabIndexAttr, 10);
    // only return true if it is 0 or higher -1 is ignored because it's only programmatically focusable
    if (tabIndexValue >= 0) return true;
  }

  return false;
};