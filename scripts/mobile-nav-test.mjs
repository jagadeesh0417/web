import { chromium } from "playwright";

const url = process.env.URL || "http://localhost:3000";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });

const menuBtn = await page.locator('header button[aria-label*="menu" i]').first();
await menuBtn.click();
await page.waitForTimeout(300);

const mobileNav = await page.locator('#mobile-navigation');
const visible = await mobileNav.isVisible();
const servicesGroup = await mobileNav.locator('button:has-text("Services")').count() > 0;
console.log(JSON.stringify({
  mobileMenuOpen: visible,
  servicesGroupVisible: servicesGroup,
}, null, 2));
await browser.close();
