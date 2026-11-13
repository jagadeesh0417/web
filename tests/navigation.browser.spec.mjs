import { test, expect } from "@playwright/test";

const baseURL = process.env.URL || "http://localhost:3100";

test("desktop dropdowns support hover, click, outside click and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseURL);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const label of ["Services", "Internships", "Resources"]) {
    const trigger = nav.getByRole("button", { name: label, exact: true });
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dropdown = trigger.locator("..");
    const link = dropdown.locator("a").first();
    const box = await link.boundingBox();
    await page.mouse.move(box.x + 10, box.y + 10, { steps: 12 });
    await expect(link).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator("main").first().click({ position: { x: 5, y: 5 } });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
});

for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`mobile navigation toggles at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(baseURL);
    await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Mobile navigation" });
    for (const label of ["Services", "Internships", "Resources"]) {
      const trigger = nav.getByRole("button", { name: label, exact: true });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });
}

test("mobile navigation responds to touch", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(baseURL);
    await page.getByRole("button", { name: "Open menu" }).tap();
    const nav = page.getByRole("navigation", { name: "Mobile navigation" });
    for (const label of ["Services", "Internships", "Resources"]) {
      const trigger = nav.getByRole("button", { name: label, exact: true });
      await trigger.tap();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await trigger.tap();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  } finally {
    await context.close();
  }
});
