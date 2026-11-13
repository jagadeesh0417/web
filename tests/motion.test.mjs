import { test } from "node:test";
import assert from "node:assert/strict";

import {
  REDUCED_MOTION_QUERY,
  prefersReducedMotion,
  reducedMotionServerSnapshot,
  reducedMotionSnapshot,
  reducedMotionSubscribe,
} from "../src/lib/motion/reduced-motion-store.ts";
import {
  computeRevealShow,
  computeRevealDelay,
  computeStaggerDelay,
  mobileMenuAria,
  handleMenuKeyDown,
  timelineGridVars,
  timelineProgress,
} from "../src/lib/motion/helpers.ts";

/**
 * These tests exercise the pure logic that backs the motion components. React
 * components themselves use JSX and cannot be executed by Node's type-stripping
 * loader, so the decision logic is extracted into `helpers.ts` / `reduced-motion-store.ts`
 * and tested here directly. No browser hydration is asserted — only the
 * server/client snapshot invariant that the fix depends on.
 */

function withMockWindow(matches, install) {
  const listeners = new Set();
  const original = globalThis.window;
  const calls = { add: 0, remove: 0 };
  globalThis.window = {
    matchMedia(query) {
      assert.equal(query, REDUCED_MOTION_QUERY);
      return {
        matches,
        addEventListener: (type, cb) => {
          if (type === "change") listeners.add(cb);
          calls.add++;
        },
        removeEventListener: (type, cb) => {
          if (type === "change") listeners.delete(cb);
          calls.remove++;
        },
      };
    },
  };
  try {
    return install(() => [...listeners], calls);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
}

test("prefersReducedMotion is server-safe when window is absent", () => {
  const hadWindow = "window" in globalThis;
  const original = globalThis.window;
  delete globalThis.window;
  try {
    assert.equal(prefersReducedMotion(), false);
  } finally {
    if (hadWindow) globalThis.window = original;
  }
});

test("reduced-motion server snapshot is always false (hydration invariant)", () => {
  // During SSR and the first client render this must agree so markup matches.
  assert.equal(reducedMotionServerSnapshot(), false);
});

test("reduced-motion client snapshot reflects the browser preference", () => {
  withMockWindow(true, () => {
    assert.equal(reducedMotionSnapshot(), true);
  });
  withMockWindow(false, () => {
    assert.equal(reducedMotionSnapshot(), false);
  });
});

test("reduced-motion subscribe registers a change listener and cleans up", () => {
  withMockWindow(false, (getListeners, calls) => {
    let fired = 0;
    const onChange = () => { fired++; };
    const unsubscribe = reducedMotionSubscribe(onChange);
    assert.equal(getListeners().length, 1, "one change listener attached");
    assert.equal(calls.add, 1);

    // Simulate a preference change.
    for (const cb of getListeners()) cb({ matches: true });
    assert.equal(fired, 1);

    unsubscribe();
    assert.equal(getListeners().length, 0, "listener removed on cleanup");
    assert.equal(calls.remove, 1);
  });
});

test("reduced-motion subscribe is a no-op without window", () => {
  const hadWindow = "window" in globalThis;
  const original = globalThis.window;
  delete globalThis.window;
  try {
    const unsub = reducedMotionSubscribe(() => {});
    assert.equal(typeof unsub, "function");
    assert.doesNotThrow(() => unsub());
  } finally {
    if (hadWindow) globalThis.window = original;
  }
});

test("computeRevealShow: reduced motion forces the visible state immediately", () => {
  assert.equal(computeRevealShow(false, false), false);
  assert.equal(computeRevealShow(false, true), true);
  assert.equal(computeRevealShow(true, false), true, "reduced motion shows without waiting");
  assert.equal(computeRevealShow(true, true), true);
});

test("computeRevealDelay: zero when reduced, clamped otherwise", () => {
  assert.equal(computeRevealDelay(true, 250), 0);
  assert.equal(computeRevealDelay(false, 250), 250);
  assert.equal(computeRevealDelay(false, -40), 0, "negative delays clamp to 0");
});

test("computeStaggerDelay: caps so late items are not laggy", () => {
  assert.equal(computeStaggerDelay(true, 3, 80), 0);
  assert.equal(computeStaggerDelay(false, 0, 80), 0);
  assert.equal(computeStaggerDelay(false, 2, 80, 100), 260); // 100 + 2*80
  assert.equal(computeStaggerDelay(false, 99, 80, 0, 6), 480, "index capped at maxItems (6)");
});

test("mobileMenuAria: closed menus are hidden and inert, open menus are not", () => {
  assert.deepEqual(mobileMenuAria(false), { "aria-hidden": true, inert: true });
  assert.deepEqual(mobileMenuAria(true), { "aria-hidden": false, inert: false });
});

test("handleMenuKeyDown: Escape closes, other keys ignored", () => {
  let closed = 0;
  assert.equal(handleMenuKeyDown({ key: "Escape" }, { onClose: () => { closed++; } }), true);
  assert.equal(closed, 1);
  assert.equal(handleMenuKeyDown({ key: "Esc" }, { onClose: () => { closed++; } }), true); // legacy alias
  assert.equal(closed, 2);
  assert.equal(handleMenuKeyDown({ key: "Enter" }, { onClose: () => { closed++; } }), false);
  assert.equal(closed, 2, "Enter must not close");
});

test("handleMenuKeyDown: no close handler does not throw", () => {
  assert.doesNotThrow(() => handleMenuKeyDown({ key: "Escape" }, {}));
});

test("timelineGridVars always defines --m-cols and clamps the count", () => {
  assert.deepEqual(timelineGridVars(4), { "--m-cols": "4" });
  assert.equal(timelineGridVars(0)["--m-cols"], "1", "min 1 column");
  assert.equal(timelineGridVars(50, 6)["--m-cols"], "6", "clamped to max");
  assert.equal(timelineGridVars(3)["--m-cols"], "3");
});

test("timelineProgress is a 0..1 ratio and safe for a single step", () => {
  assert.equal(timelineProgress(0, 4), 0);
  assert.equal(timelineProgress(1, 4), 0.3333333333333333);
  assert.equal(timelineProgress(3, 4), 1);
  assert.equal(timelineProgress(0, 1), 1, "single step is fully progressed");
});