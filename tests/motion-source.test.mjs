import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * Source-level regression guards. Node cannot execute the JSX components, so
 * these assert that the specific defects from the integration review were fixed
 * in the committed source, and would fail if they were reintroduced.
 */

const read = (p) => readFile(p, "utf8");

test("reduced-motion hook uses useSyncExternalStore with a fixed server snapshot (no matchMedia during render)", async () => {
  const hook = await read("src/lib/motion/reduced-motion.ts");
  assert.match(hook, /useSyncExternalStore/);
  assert.match(hook, /reducedMotionServerSnapshot/, "must supply a server snapshot");
  assert.doesNotMatch(hook, /useState\s*\(\s*\(\)\s*=>\s*prefersReducedMotion/, "must not read matchMedia during render");
});

test("use-in-view stabilises the callback ref and disconnects the observer on cleanup", async () => {
  const hook = await read("src/lib/motion/use-in-view.ts");
  assert.match(hook, /useCallback/, "callback ref must be memoised");
  assert.match(hook, /return\s*\(\)\s*=>\s*observer\.disconnect\(\)/, "observer must be disconnected in effect cleanup");
  // No observer construction inside a per-render callback that isn't memoised.
  assert.doesNotMatch(hook, /const ref = \(node/, "ref must not be an inline per-render function");
});

test("hover effects are gated to hover-capable pointers", async () => {
  const css = await read("src/components/motion/motion.module.css");
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  // Every `:hover` rule must be indented (i.e. inside the hover media query).
  // A top-level (unindented) `.m-*:hover` selector would leak hover styles to touch.
  const topLevelHover = css
    .split(/\r?\n/)
    .filter((line) => /^\.m-[^\n]*:hover[^\n]*\{/.test(line));
  assert.deepEqual(topLevelHover, [], `unexpected un-gated :hover rules: ${topLevelHover.join(", ")}`);
  // Focus/active indicators must stay ungated so keyboards + touch still get feedback.
  assert.match(css, /^\.m-btn:active/m, "active state stays ungated");
  assert.match(css, /^\.m-btn:focus-visible/m, "focus-visible stays ungated");
});

test("mobile menu animates without max-height clipping", async () => {
  const css = await read("src/components/motion/motion.module.css");
  assert.doesNotMatch(css, /\.m-mobileMenu[\s\S]*?max-height/, "must not animate max-height");
  assert.match(css, /\.m-mobileMenu\s*\{[\s\S]*?grid-template-rows:\s*0fr/);
  assert.match(css, /\.m-mobileMenuOpen\s*\{[\s\S]*?grid-template-rows:\s*1fr/);
});

test("horizontal timeline defines a concrete column variable (no undefined --cols)", async () => {
  const css = await read("src/components/motion/motion.module.css");
  const component = await read("src/components/motion/WorkflowTimeline.tsx");
  assert.doesNotMatch(css + component, /var\(--cols\)/, "the old undefined --cols must be gone");
  assert.match(css, /--m-cols/, "a real --m-cols is used");
  assert.match(component, /timelineGridVars/, "component sets --m-cols inline");
});

test("StickyHeader does not emit a header landmark by default", async () => {
  const nav = await read("src/components/motion/Navigation.tsx");
  assert.match(nav, /as: Tag = "div"/, "defaults to a non-landmark element");
  assert.doesNotMatch(nav, /<header/, "component does not render <header>");
});
