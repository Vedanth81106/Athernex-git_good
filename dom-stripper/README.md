Kintsugi DOM Stripper: Test Guide

This tool reduces a massive, messy live DOM into a clean, token-efficient JSON for our AI agents. It uses an 11-pass stripping pipeline to remove noise while preserving critical interactive elements via the AOM (Accessibility Object Model) Gate.

-------------Python testing-------------------
create the file : middleware/inject.py

```python
    from pathlib import Path
    import json

    # Path resolution: Go up to KINTSUGI root, then into dom-stripper
    BUNDLE_PATH = Path(__file__).parent.parent / "dom-stripper" / "dist" / "bundle.iife.js"

    async def get_stripped_dom(page):
        """
        Injects the Kintsugi bundle into the current Playwright page 
        and returns the processed DOM JSON.
        """
        if not BUNDLE_PATH.exists():
            raise FileNotFoundError(
                f"❌ Bundle not found at {BUNDLE_PATH}. "
                "Make sure someone has run 'npm run build' in the dom-stripper folder."
            )

        # Read the bundled JS
        bundle_code = BUNDLE_PATH.read_text(encoding="utf-8")

        # Inject the entire stripper logic into the browser
        await page.evaluate(bundle_code)

        # Execute the orchestrator and capture the JSON result
        print("🛡️  Kintsugi: Stripping DOM...")
        stripped_dom = await page.evaluate("Kintsugi.extractStrippedDOM()")
        
        return stripped_dom
```
then import it like so:


```python

    from inject import get_stripped_dom

    async def on_automation_failure(page):
        # 1. Get the cleaned DOM
        dom_data = await get_stripped_dom(page)
        
        print(f"✅ Received {len(dom_data)} optimized nodes.")
        
        # 2. Feed dom_data to the AI Agent
        # response = await agent.get_fix(dom_data)
```

---------------Manual Console Testing---------------------

If you want to test the reduction performance on any live website (Amazon, GitHub, Salesforce), follow these steps:

    Open the website you want to test.

    Open DevTools (Press F12 or Ctrl+Shift+I).

    Paste the following bundle into the Console and hit Enter( iknow its massive but trust ):

```javascript
    var Kintsugi = (() => {
      var __defProp = Object.defineProperty;
      var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames = Object.getOwnPropertyNames;
      var __hasOwnProp = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all)
          __defProp(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
              __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

      // src/index.js
      var index_exports = {};
      __export(index_exports, {
        default: () => index_default,
        extractStrippedDOM: () => extractStrippedDOM
      });

      // config/config.js
      var CONFIG = {
        DEPTH_CAP: 12,
        OVERLAY_Z_INDEX_THRESHOLD: 100,
        OVERLAY_VIEWPORT_COVERAGE: 0.5,
        DEDUP_FREQUENCY_THRESHOLD: 3,
        OFFSCREEN_BUFFER: 500,
        // px
        SETTLE_MS: 300
      };

      // src/prechecks/settle.js
      var waitForNetworkSettle = (timeout = 3e3) => {
        return new Promise((resolve) => {
          let timer;
          let settled = false;
          const settle = () => {
            if (settled) return;
            settled = true;
            observer.disconnect();
            clearTimeout(timer);
            resolve();
          };
          const observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(settle, CONFIG.SETTLE_MS);
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
          timer = setTimeout(settle, CONFIG.SETTLE_MS);
          setTimeout(settle, timeout);
        });
      };

      // src/prechecks/aomGate.js
      var AOM_ATTRIBUTES = [
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "role",
        "alt",
        "title",
        "tabindex",
        "placeholder"
      ];
      var hasAOMData = (el) => {
        if (Array.from(el.attributes).some((attr) => attr.name.startsWith("aria-"))) return true;
        return AOM_ATTRIBUTES.some((attr) => el.hasAttribute(attr));
      };
      var processAOMNode = (el) => {
        if (el.getAttribute("aria-hidden") === "true") {
          el.dataset.stripSkip = "true";
          return null;
        }
        if (!hasAOMData(el)) return null;
        el.dataset.aomProtected = "true";
        const resolveId = (id) => id ? document.getElementById(id)?.innerText?.trim() ?? "" : "";
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          ariaDescription: resolveId(el.getAttribute("aria-describedby")),
          ariaLabelledBy: resolveId(el.getAttribute("aria-labelledby")),
          tabindex: el.getAttribute("tabindex") || "",
          alt: el.getAttribute("alt") || "",
          title: el.getAttribute("title") || "",
          placeholder: el.getAttribute("placeholder") || "",
          innerText: el.innerText?.trim() || "",
          isAOMNode: true
        };
      };

      // src/strips/strip1_blocklist.js
      var BLOCKLIST_TAGS = [
        "SCRIPT",
        "STYLE",
        "NOSCRIPT",
        "TEMPLATE",
        "SVG",
        "CANVAS",
        "PATH",
        "IFRAME",
        "VIDEO",
        "AUDIO",
        "SOURCE",
        "TRACK",
        "EMBED",
        "OBJECT",
        "META",
        "LINK"
      ];
      var attachPseudoText = (el) => {
        const before = window.getComputedStyle(el, "::before").content;
        const after = window.getComputedStyle(el, "::after").content;
        const clean = (val) => val && val !== "none" && val !== '""' ? val.replace(/^["']|["']$/g, "") : "";
        const text = [clean(before), clean(after)].filter(Boolean).join(" ");
        if (text) el._pseudoText = text;
      };
      var applyStrip1 = (elements) => {
        return elements.filter((el) => {
          if (BLOCKLIST_TAGS.includes(el.tagName)) return false;
          attachPseudoText(el);
          return true;
        });
      };

      // src/strips/strip2_visibility.js
      var applyStrip2 = (elements) => {
        return elements.filter((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0" || style.fontSize === "0px") return false;
          if (style.display === "contents") return true;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false;
          return true;
        });
      };

      // src/strips/strip3_positional.js
      var applyStrip3 = (elements) => {
        const vWidth = window.innerWidth;
        const vHeight = window.innerHeight;
        return elements.filter((el) => {
          const style = window.getComputedStyle(el);
          const position = style.position;
          if (position !== "absolute" && position !== "fixed") return true;
          const left = parseFloat(style.left);
          const top = parseFloat(style.top);
          if (!isNaN(left) && left < -vWidth) return false;
          if (!isNaN(top) && top < -vHeight) return false;
          if (style.clip === "rect(0px, 0px, 0px, 0px)" || style.clip === "rect(0, 0, 0, 0)") return false;
          if (style.clipPath === "inset(100%)" || style.clipPath === "inset(50%)") return false;
          return true;
        });
      };

      // src/strips/strip4_zeroSize.js
      var applyStrip4 = (elements) => {
        return elements.filter((el) => {
          if (window.getComputedStyle(el).display === "contents") return true;
          const rect = el.getBoundingClientRect();
          return !(rect.width === 0 && rect.height === 0);
        });
      };

      // src/strips/strip5_offscreen.js
      var applyStrip5 = (elements) => {
        const vWidth = window.innerWidth;
        const vHeight = window.innerHeight;
        const BUFFER = CONFIG.OFFSCREEN_BUFFER;
        return elements.filter((el) => {
          const rect = el.getBoundingClientRect();
          const isWayOff = rect.bottom < -BUFFER || rect.top > vHeight + BUFFER || rect.right < -BUFFER || rect.left > vWidth + BUFFER;
          if (isWayOff) {
            const style = window.getComputedStyle(el);
            if (style.position === "fixed" || style.position === "sticky") {
              return true;
            }
            return false;
          }
          return true;
        });
      };

      // src/utils/interactive.js
      var INTERACTIVE_WHITELIST = [
        "A",
        "BUTTON",
        "INPUT",
        "SELECT",
        "TEXTAREA",
        "OPTION",
        "DETAILS",
        "SUMMARY"
      ];

      // src/strips/strip6_emptyText.js
      var applyStrip6 = (elements) => {
        return elements.filter((el) => {
          const text = el.innerText?.trim() || "";
          const pseudoText = el._pseudoText || "";
          const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName);
          const hasOnclick = el.hasAttribute("onclick");
          const hasAnchor = el.id || Array.from(el.attributes).some(
            (a) => a.name.startsWith("data-") || a.name.startsWith("aria-") || a.name === "role"
          );
          const hasNoText = text === "" && pseudoText === "";
          if (hasNoText && !isInteractive && !hasOnclick && !hasAnchor) {
            return false;
          }
          return true;
        });
      };

      // src/strips/strip7_collapse.js
      var COLLAPSIBLE_TAGS = ["span", "em", "strong", "b", "i", "u", "small", "sup", "sub", "abbr", "cite", "mark"];
      var applyStrip7 = (elements) => {
        const survivingSet = new Set(elements);
        return elements.filter((el) => {
          if (!COLLAPSIBLE_TAGS.includes(el.tagName.toLowerCase())) return true;
          if (INTERACTIVE_WHITELIST.includes(el.tagName)) return true;
          if (el.hasAttributes()) return true;
          const parent = el.parentElement;
          if (!parent || !survivingSet.has(parent)) return true;
          return false;
        });
      };

      // src/strips/strip8_depthCap.js
      var applyStrip8 = (elements) => {
        return elements.filter((el) => {
          if (el._depth === void 0) {
            let depth = 0;
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
              depth++;
              parent = parent.parentElement;
            }
            el._depth = depth;
          }
          if (el._depth > 12) {
            const hasText = el.innerText?.trim().length > 0;
            const hasAttributes = el.hasAttributes();
            const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName);
            if (!hasText && !hasAttributes && !isInteractive) return false;
          }
          return true;
        });
      };

      // src/strips/strip9_dedup.js
      var applyStrip9 = (elements) => {
        const seenExact = /* @__PURE__ */ new Set();
        const pass1 = elements.filter((el) => {
          const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, " ") || "";
          const depth = el._depth ?? 0;
          const signature = `${el.tagName}-${text}-${depth}`;
          if (seenExact.has(signature)) return false;
          seenExact.add(signature);
          return true;
        });
        const textFrequency = {};
        for (const el of pass1) {
          const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, " ") || "";
          if (text) textFrequency[text] = (textFrequency[text] || 0) + 1;
        }
        const firstOccurrenceTracked = /* @__PURE__ */ new Set();
        return pass1.filter((el) => {
          const text = el.innerText?.trim().toLowerCase().replace(/\s+/g, " ") || "";
          const isInteractive = INTERACTIVE_WHITELIST.includes(el.tagName) || el.hasAttribute("onclick");
          if (isInteractive) return true;
          if (textFrequency[text] > CONFIG.DEDUP_FREQUENCY_THRESHOLD) {
            if (firstOccurrenceTracked.has(text)) return false;
            firstOccurrenceTracked.add(text);
            return true;
          }
          return true;
        });
      };

      // src/strips/strip10_overlay.js
      var applyStrip10 = (elements) => {
        const vWidth = window.innerWidth;
        const vHeight = window.innerHeight;
        const viewportArea = vWidth * vHeight;
        return elements.map((el) => {
          const style = window.getComputedStyle(el);
          const zIndex = parseInt(style.zIndex);
          const rect = el.getBoundingClientRect();
          const elementArea = rect.width * rect.height;
          const isFixed = style.position === "fixed" || style.position === "sticky";
          if (!isNaN(zIndex) && zIndex > CONFIG.OVERLAY_Z_INDEX_THRESHOLD || isFixed) {
            if (elementArea > viewportArea * CONFIG.OVERLAY_VIEWPORT_COVERAGE) {
              el._overlay = true;
              el._overlayWarning = `Covers >50% of viewport at z-index ${zIndex}. Handle before proceeding.`;
            }
          }
          return el;
        });
      };

      // src/strips/strip11_priority.js
      var PRIORITY_MAP = {
        CRITICAL: ["H1", "H2", "H3", "LABEL", "CAPTION", "FIGCAPTION"],
        HIGH: ["H4", "H5", "H6", "P", "LI", "DT", "DD"],
        MEDIUM: ["TD", "TH", "BLOCKQUOTE", "PRE", "CODE", "A"],
        LOW: ["DIV", "SECTION", "ARTICLE", "SPAN", "HEADER", "FOOTER"]
      };
      var INTERACTIVE_TAGS = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"];
      var applyStrip11 = (elements) => {
        return elements.map((el) => {
          let priority = "low";
          const tag = el.tagName;
          if (PRIORITY_MAP.CRITICAL.includes(tag)) priority = "critical";
          else if (PRIORITY_MAP.HIGH.includes(tag)) priority = "high";
          else if (PRIORITY_MAP.MEDIUM.includes(tag)) priority = "medium";
          const isInteractive = INTERACTIVE_TAGS.includes(tag) || el.hasAttribute("onclick");
          if (isInteractive) priority = "critical";
          const zIndex = parseInt(window.getComputedStyle(el).zIndex);
          if (!isNaN(zIndex) && zIndex > 10 && zIndex <= 100) {
            if (priority === "low") priority = "medium";
            else if (priority === "medium") priority = "high";
            else if (priority === "high") priority = "critical";
          }
          el._priority = priority;
          return el;
        });
      };

      // src/utils/xpath.js
      var getResilientXPath = (el) => {
        if (!(el instanceof Element)) return "";
        if (el.id) return `//*[@id="${el.id}"]`;
        const goldenAttrs = ["data-testid", "data-cy", "data-qa"];
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
          if (current.tagName === "BODY") {
            parts.unshift("html[1]");
            break;
          }
          current = current.parentNode;
        }
        const fullPath = parts.join("/");
        return fullPath.startsWith("*") ? `//${fullPath}` : `/${fullPath}`;
      };

      // src/emit/emitNode.js
      var emitNode = (el) => {
        const style = window.getComputedStyle(el);
        const resolveId = (id) => id ? document.getElementById(id)?.innerText?.trim() ?? "" : "";
        return {
          tag: el.tagName.toLowerCase(),
          innerText: el.innerText?.trim() || "",
          pseudoText: el._pseudoText || "",
          id: el.id || "",
          classes: Array.from(el.classList),
          dataAttributes: Object.fromEntries(
            Array.from(el.attributes).filter((a) => a.name.startsWith("data-")).map((a) => [a.name, a.value])
          ),
          role: el.getAttribute("role") || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          ariaDescription: resolveId(el.getAttribute("aria-describedby")),
          ariaLabelledBy: resolveId(el.getAttribute("aria-labelledby")),
          tabindex: el.getAttribute("tabindex") || "",
          depth: el._depth || 0,
          zIndex: parseInt(style.zIndex) || 0,
          overlay: !!el._overlay,
          overlayWarning: el._overlayWarning || "",
          priority: el._priority || "low",
          xpath: getResilientXPath(el)
        };
      };

      // src/index.js
      var collectElements = (root) => Array.from(root.querySelectorAll("*"));
      var extractStrippedDOM = async () => {
        console.group("Kintsugi DOM Stripper");
        const startTime = performance.now();
        await waitForNetworkSettle();
        const allRoots = [document];
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
          { name: "Blocklist", fn: applyStrip1 },
          { name: "Visibility", fn: applyStrip2 },
          { name: "Positional", fn: applyStrip3 },
          { name: "ZeroSize", fn: applyStrip4 },
          { name: "Offscreen", fn: applyStrip5 },
          { name: "EmptyText", fn: applyStrip6 },
          { name: "Collapse", fn: applyStrip7 },
          { name: "DepthCap", fn: applyStrip8 }
        ];
        let surviving = candidateElements;
        strips.forEach((strip) => {
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
        surviving = applyStrip10(surviving);
        const aomEls = rawAOMNodes.map((n) => n.el);
        applyStrip10(aomEls);
        const before11 = surviving.length;
        surviving = applyStrip11(surviving);
        console.log(`[Priority] Tagged: ${surviving.length} nodes`);
        const emittedRegular = surviving.map(emitNode);
        const emittedAOM = rawAOMNodes.map(({ el, aomNode }) => {
          const base = emitNode(el);
          return { ...base, ...aomNode, vip: true };
        });
        const aomOverlays = emittedAOM.filter((n) => n.overlay);
        const aomNonOverlays = emittedAOM.filter((n) => !n.overlay);
        const regOverlays = emittedRegular.filter((n) => n.overlay);
        const regRest = emittedRegular.filter((n) => !n.overlay);
        const finalResult = [...aomOverlays, ...regOverlays, ...aomNonOverlays, ...regRest];
        const endTime = performance.now();
        console.log(`---`);
        console.log(`Final Nodes: ${finalResult.length}`);
        console.log(`Reduction: ${((1 - finalResult.length / rawCount) * 100).toFixed(2)}%`);
        console.log(`Execution Time: ${(endTime - startTime).toFixed(2)}ms`);
        console.groupEnd();
        return finalResult;
      };
      var Kintsugi = {
        extractStrippedDOM
      };
      var index_default = Kintsugi;
      return __toCommonJS(index_exports);
    })();
    window.Kintsugi = Kintsugi;
    Kintsugi.extractStrippedDOM().then(res => {
      console.log("Kintsugi Output:", res);
      console.log("Check the 'Kintsugi DOM Stripper' group above for the reduction stats!");
    });

```

How to read the results

Once the script finishes, check the Console Group labeled Kintsugi DOM Stripper. You will see:

    Initial Nodes: Total elements before stripping.

    VIP AOM Nodes: Elements protected by the "AOM Gate" (Interactive/ARIA nodes).

    Strip Logs: How many nodes each specific logic (Visibility, Offscreen, etc.) removed.

    Reduction %: Our efficiency metric (Aim for >70% on complex sites).

Pro-Tips for the Team

    Inspection: Type console.table(window._kintsugi.slice(0, 10)) to see the top-priority nodes (Overlays and Critical headers).

    XPath Check: Every node in the output has a resilientXPath. You can verify it by running $x("YOUR_XPATH_HERE") in the console.

    Debugging: If a critical button was removed, check [Visibility] or [EmptyText] logs to see where it might have been caught.

Have fun stripping! 🦾
