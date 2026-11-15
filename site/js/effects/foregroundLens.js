// Deprecated: 
// This effect is too expensive to run on large pages and is not currently used in the site. 
// It may be re-enabled in the future if performance can be improved.

// import { EFFECTS_CONFIG } from "../config/effectsConfig.js";
// import { smoothstep01, solveUndistortedRadius } from "../utils/math.js";

// const VIEWPORT_BUFFER = 160;
// const ELEMENT_SELECTOR = '[data-lens="element"]';

// export function createForegroundLens() {
//   let readyPromise = null;
//   let resolveReady = null;

//   let frameId = null;
//   let needsRebuild = true;
//   let disposed = false;

//   let resizeObserver = null;
//   let mutationObserver = null;

//   // Cached, untransformed document-space positions.
//   let entries = [];

//   // Prepare text for character-level distortion.
//   function prepareForegroundText() {
//     const elements = document.querySelectorAll(".distortible");

//     const segmenter =
//       typeof Intl.Segmenter === "function"
//         ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
//         : null;

//     for (const element of elements) {
//       const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

//       const textNodes = [];

//       while (walker.nextNode()) {
//         const node = walker.currentNode;

//         if (
//           node.parentElement?.closest(".lens-word, .lens-char") ||
//           !node.nodeValue.trim()
//         ) {
//           continue;
//         }

//         textNodes.push(node);
//       }

//       for (const node of textNodes) {
//         const fragment = document.createDocumentFragment();
//         const tokens = node.nodeValue.match(/\s+|\S+/gu) || [];

//         for (const token of tokens) {
//           if (/^\s+$/u.test(token)) {
//             fragment.append(document.createTextNode(token));
//             continue;
//           }

//           const word = document.createElement("span");
//           word.className = "lens-word";

//           const characters = segmenter
//             ? [...segmenter.segment(token)].map((item) => item.segment)
//             : Array.from(token);

//           for (const character of characters) {
//             const glyph = document.createElement("span");
//             glyph.className = "lens-char";
//             glyph.textContent = character;
//             word.append(glyph);
//           }

//           fragment.append(word);
//         }

//         node.replaceWith(fragment);
//       }
//     }
//   }

//   // Remove transforms owned by this effect before measuring layout.
//   function clearOwnedStyles(elements) {
//     for (const element of elements) {
//       element.style.transform = "";
//       element.style.opacity = "";
//       element.style.filter = "";
//     }
//   }

//   // Measure positions only when the actual layout changes.
//   function collectLayoutEntries() {
//     const glyphs = [...document.querySelectorAll(".lens-char")];

//     const lensElements = [
//       ...document.querySelectorAll(ELEMENT_SELECTOR),
//     ].filter((element) => !element.closest(".distortible"));

//     const targets = [...glyphs, ...lensElements];

//     // Complete all style resets before performing layout reads.
//     clearOwnedStyles(targets);

//     const scrollX = window.scrollX;
//     const scrollY = window.scrollY;
//     const nextEntries = [];

//     for (const element of glyphs) {
//       const rect = element.getBoundingClientRect();

//       nextEntries.push({
//         element,
//         type: "glyph",
//         documentX: rect.left + rect.width * 0.5 + scrollX,
//         documentY: rect.top + rect.height * 0.5 + scrollY,
//       });
//     }

//     for (const element of lensElements) {
//       const rect = element.getBoundingClientRect();

//       nextEntries.push({
//         element,
//         type: "element",
//         documentX: rect.left + rect.width * 0.5 + scrollX,
//         documentY: rect.top + rect.height * 0.5 + scrollY,
//       });
//     }

//     // Enables efficient lookup of entries near the viewport.
//     nextEntries.sort((a, b) => a.documentY - b.documentY);

//     entries = nextEntries;
//   }

//   // Binary search for the first entry near the viewport.
//   function lowerBoundDocumentY(minimumY) {
//     let low = 0;
//     let high = entries.length;

//     while (low < high) {
//       const middle = (low + high) >>> 1;

//       if (entries[middle].documentY < minimumY) {
//         low = middle + 1;
//       } else {
//         high = middle;
//       }
//     }

//     return low;
//   }

//   // Apply the inverse radial lens mapping to one entry.
//   function applyLensTransform(entry, viewportX, viewportY, width, height) {
//     const halfHeight = Math.max(height * 0.5, 1);
//     const centerX = width * 0.5;
//     const centerY = height * 0.5;
//     const strength = EFFECTS_CONFIG.fisheye;

//     const qx = (viewportX - centerX) / halfHeight;
//     const qy = -(viewportY - centerY) / halfHeight;

//     const distortedRadius = Math.hypot(qx, qy);

//     if (distortedRadius < 0.0001) {
//       entry.element.style.transform = "none";
//     } else {
//       const radius = solveUndistortedRadius(distortedRadius, strength);

//       const ratio = radius / distortedRadius;

//       const px = qx * ratio;
//       const py = qy * ratio;

//       const mappedX = centerX + px * halfHeight;
//       const mappedY = centerY - py * halfHeight;

//       const translateX = mappedX - viewportX;
//       const translateY = mappedY - viewportY;

//       // Local inverse Jacobian of the radial lens.
//       const tangential = 1 / (1 + strength * radius * radius);

//       const radial = 1 / (1 + 3 * strength * radius * radius);

//       const delta = radial - tangential;

//       const ux = px / radius;
//       const uy = py / radius;

//       const a = tangential + delta * ux * ux;
//       const b = -delta * ux * uy;
//       const c = -delta * ux * uy;
//       const d = tangential + delta * uy * uy;

//       entry.element.style.transform =
//         `translate3d(${translateX}px, ${translateY}px, 0) ` +
//         `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;
//     }

//     // Preserve the original character-level edge fade.
//     if (entry.type === "glyph") {
//       const edgeDistance = Math.min(viewportY, height - viewportY);

//       const fadeProgress =
//         (edgeDistance - height * 0.035) / (height * 0.16 - height * 0.035);

//       const fade = smoothstep01(fadeProgress);

//       entry.element.style.opacity = fade.toFixed(3);

//       entry.element.style.filter = `blur(${((1 - fade) * 3).toFixed(2)}px)`;
//     }
//   }

//   // Update only entries inside the viewport and its buffer.
//   function renderVisibleEntries() {
//     if (!entries.length) return;

//     const width = window.innerWidth;
//     const height = window.innerHeight;

//     const scrollX = window.scrollX;
//     const scrollY = window.scrollY;

//     const firstVisible = lowerBoundDocumentY(scrollY - VIEWPORT_BUFFER);

//     const lastDocumentY = scrollY + height + VIEWPORT_BUFFER;

//     for (let index = firstVisible; index < entries.length; index += 1) {
//       const entry = entries[index];

//       if (entry.documentY > lastDocumentY) break;

//       const viewportX = entry.documentX - scrollX;
//       const viewportY = entry.documentY - scrollY;

//       applyLensTransform(entry, viewportX, viewportY, width, height);
//     }
//   }

//   // Consolidate all updates into one animation frame.
//   function scheduleUpdate(rebuild = false) {
//     if (disposed) return;

//     if (rebuild) needsRebuild = true;

//     if (frameId !== null) return;

//     frameId = requestAnimationFrame(() => {
//       frameId = null;

//       if (needsRebuild) {
//         needsRebuild = false;
//         collectLayoutEntries();
//       }

//       renderVisibleEntries();

//       // Resolve initialization after the first complete lens pass.
//       if (resolveReady) {
//         resolveReady();
//         resolveReady = null;
//       }
//     });
//   }

//   function handleScroll() {
//     scheduleUpdate();
//   }

//   function handleLayoutChange() {
//     scheduleUpdate(true);
//   }

//   function handleMutations() {
//     prepareForegroundText();
//     scheduleUpdate(true);
//   }

//   function init() {
//     if (readyPromise) return readyPromise;

//     readyPromise = new Promise((resolve) => {
//       resolveReady = resolve;
//     });

//     prepareForegroundText();
//     scheduleUpdate(true);

//     window.addEventListener("scroll", handleScroll, { passive: true });

//     window.addEventListener("resize", handleLayoutChange);
//     window.addEventListener("load", handleLayoutChange);

//     if (document.fonts?.ready) {
//       document.fonts.ready.then(() => {
//         scheduleUpdate(true);
//       });
//     }

//     const app = document.querySelector("#app");

//     if ("ResizeObserver" in window && app) {
//       resizeObserver = new ResizeObserver(handleLayoutChange);
//       resizeObserver.observe(app);
//     }

//     if ("MutationObserver" in window && app) {
//       mutationObserver = new MutationObserver(handleMutations);

//       mutationObserver.observe(app, {
//         childList: true,
//         characterData: true,
//         subtree: true,
//       });
//     }

//     return readyPromise;
//   }

//   function dispose() {
//     disposed = true;

//     window.removeEventListener("scroll", handleScroll);
//     window.removeEventListener("resize", handleLayoutChange);
//     window.removeEventListener("load", handleLayoutChange);

//     if (frameId !== null) {
//       cancelAnimationFrame(frameId);
//       frameId = null;
//     }

//     resizeObserver?.disconnect();
//     mutationObserver?.disconnect();

//     clearOwnedStyles(entries.map((entry) => entry.element));

//     entries = [];
//   }

//   return {
//     init,
//     update: () => scheduleUpdate(true),
//     dispose,
//   };
// }
