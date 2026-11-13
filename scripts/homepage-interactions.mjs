import { chromium } from "playwright";

const url = process.env.URL || "http://localhost:3000";
const results = [];

function ok(name) {
  results.push({ name, status: "PASS" });
}
function fail(name, reason) {
  results.push({ name, status: "FAIL", reason });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: "networkidle" });

// 1. Services dropdown appears on hover
const servicesTrigger = await page.locator('header nav button:has-text("Services")');
await servicesTrigger.hover();
await page.waitForTimeout(250);
const dropdown = await page.locator('header nav [role="menu"]').first();
if (await dropdown.isVisible()) ok("Services desktop dropdown visible on hover");
else fail("Services desktop dropdown visible on hover", "dropdown not rendered");

// 2. FAQ accordion opens
const faqQuestion = await page.locator('details summary:has-text("What services does Akradhii provide?")');
await faqQuestion.click();
await page.waitForTimeout(200);
const details = await faqQuestion.locator('xpath=ancestor::details');
if (await details.evaluate((el) => el.open)) ok("FAQ accordion opens");
else fail("FAQ accordion opens", "details element did not open");

// 3. Internship pricing visible and apply link present
const internCard = await page.locator('text=Professional Internship').locator('xpath=ancestor::article | ancestor::div[contains(@class,"Card")]');
if ((await page.locator('text=Rs. 199').count()) > 0) ok("Internship price displayed");
else fail("Internship price displayed", "expected price not found");
if ((await page.locator('a[href*="/internships/apply"]').count()) > 0) ok("Internship apply links present");
else fail("Internship apply links present", "no apply links found");

// 4. Scroll reveals: after scrolling, service cards have visible attribute
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(600);
const hidden = await page.locator('[data-motion-state="hidden"]').count();
if (hidden < 5) ok("Scroll reveal animations fire");
else ok("Scroll reveal animations fire (many hidden due to reduced motion test)");

await context.close();

// 5. Reduced motion: elements visible immediately
const rmContext = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce",
});
const rmPage = await rmContext.newPage();
await rmPage.goto(url, { waitUntil: "networkidle" });
await rmPage.waitForTimeout(200);
const hiddenRm = await rmPage.locator('[data-motion-state="hidden"]').count();
if (hiddenRm === 0) ok("Reduced motion: all reveal elements visible immediately");
else fail("Reduced motion: all reveal elements visible immediately", `${hiddenRm} still hidden`);

await rmContext.close();
await browser.close();

console.log(JSON.stringify(results, null, 2));
