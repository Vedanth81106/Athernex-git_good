// this file makes sure that the webpage is settleed before extractingBefore extraction begins, attach a MutationObserver to `document.body`.
//  Wait until no new DOM nodes have been added for a 300ms window.
//  Also confirm page state is `networkidle` or `domcontentloaded` so all stylesheets have fully computed before any visibility checks run.

import { CONFIG } from '../../config/config.js';

export const waitForNetworkSettle = (timeout = 3000) => {
  return new Promise((resolve) => {
    let timer;
    let settled = false;

    // only runs when timer is finisehd
    const settle = () => {
      if (settled) return; // prevent multiple calls
      settled = true;
      observer.disconnect(); // stop watching page
      clearTimeout(timer); // clear any pending timers
      resolve(); // tell pipeline to move on to the next step
    };

    // this observer watches the page for any changes - deleted/new elements
    const observer = new MutationObserver(() => {
        // if any change restart clock
      clearTimeout(timer);
      timer = setTimeout(settle, CONFIG.SETTLE_MS);
    });

    // watch everything inside the body, including nested elements and changes to props
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // initial kickoff - if page is already idle, this will ensure we don't wait unnecessarily
    timer = setTimeout(settle, CONFIG.SETTLE_MS);

    // forces a settleeee after 3 seconds
    setTimeout(settle, timeout);
  });
};