import { waitForNetworkSettle, getShadowRoots } from './prechecks/settle.js';
import { processAOMNode } from './prechecks/aomGate.js';
import { applyStrip1 } from './strips/strip1_blocklist.js';
import { applyStrip2 } from './strips/strip2_visibility.js';
import { applyStrip3 } from './strips/strip3_positional.js';
import { applyStrip4 } from './strips/strip4_zeroSize.js';
import { applyStrip5 } from './strips/strip5_offscreen.js';
import { applyStrip6 } from './strips/strip6_emptyText.js';
import { applyStrip7 } from './strips/strip7_collapse.js';
import { applyStrip8 } from './strips/strip8_depthCap.js';
import { applyStrip9 } from './strips/strip9_dedup.js';
import { applyStrip10 } from './strips/strip10_overlay.js';
import { applyStrip11 } from './strips/strip11_priority.js';
import { emitNode } from './emit/emitNode.js';

const collectElements = (root) => Array.from(root.querySelectorAll('*'));

export const extractStrippedDOM = async () => {
  console.group('Kintsugi DOM Stripper');
  const startTime = performance.now();

  await waitForNetworkSettle();
  const shadowRoots = getShadowRoots();
  const allRoots = [document, ...shadowRoots];

  const rawAOMNodes = [];
  const candidateElements = [];
  let rawCount = 0;

  for (const root of allRoots) {
    const elms = collectElements(root);
    rawCount += elms.length;
    for (const el of elms) {
      const aomNode = processAOMNode(el);
      if (aomNode) {
        rawAOMNodes.push({ el, aomNode });
        continue;
      }
      candidateElements.push(el);
    }
  }

  console.log(`Initial Nodes: ${rawCount}`);
  console.log(`VIP AOM Nodes Preserved: ${rawAOMNodes.length}`);

  const strips = [
    { name: 'Blocklist',  fn: applyStrip1 },
    { name: 'Visibility', fn: applyStrip2 },
    { name: 'Positional', fn: applyStrip3 },
    { name: 'ZeroSize',   fn: applyStrip4 },
    { name: 'Offscreen',  fn: applyStrip5 },
    { name: 'EmptyText',  fn: applyStrip6 },
    { name: 'Collapse',   fn: applyStrip7 },
    { name: 'DepthCap',   fn: applyStrip8 },
  ];

  let surviving = candidateElements;

  strips.forEach(strip => {
    const before = surviving.length;
    surviving = strip.fn(surviving);
    const after = surviving.length;
    if (before !== after) {
      console.log(`[${strip.name}] Removed: ${before - after}`);
    }
  });

  const before9 = surviving.length;
  surviving = applyStrip9(surviving);
  console.log(`[Dedup] Removed: ${before9 - surviving.length}`);

  applyStrip10(surviving);
  applyStrip10(rawAOMNodes.map(n => n.el));

  const before11 = surviving.length;
  surviving = applyStrip11(surviving);
  console.log(`[Priority] Tagged: ${surviving.length} nodes`);

  const emittedRegular = surviving.map(emitNode);

  const emittedAOM = rawAOMNodes.map(({ el, aomNode }) => {
    const base = emitNode(el);
    return { ...base, ...aomNode, vip: true };
  });

  const aomOverlays    = emittedAOM.filter(n => n.overlay);
  const aomNonOverlays = emittedAOM.filter(n => !n.overlay);
  const regOverlays    = emittedRegular.filter(n => n.overlay);
  const regRest        = emittedRegular.filter(n => !n.overlay);

  const finalResult = [...aomOverlays, ...regOverlays, ...aomNonOverlays, ...regRest];

  const endTime = performance.now();
  console.log(`---`);
  console.log(`Final Nodes: ${finalResult.length}`);
  console.log(`Reduction: ${((1 - finalResult.length / rawCount) * 100).toFixed(2)}%`);
  console.log(`Execution Time: ${(endTime - startTime).toFixed(2)}ms`);
  console.groupEnd();

  return finalResult;
};

// Remove the "if (typeof window !== 'undefined')" block and use this instead:

const Kintsugi = {
    extractStrippedDOM
};

// This ensures that when esbuild wraps this in an IIFE, 
// 'extractStrippedDOM' is actually returned to the Kintsugi global.
export default Kintsugi;

// ALSO: Keep the window assignment for double-safety in the browser console
if (typeof window !== 'undefined') {
    window.extractStrippedDOM = extractStrippedDOM;
    window.Kintsugi = Kintsugi;
}