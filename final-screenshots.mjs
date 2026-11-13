import { chromium } from "playwright";

const url = "http://localhost:3000";
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-375", width: 375, height: 812 },
];

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `final-${vp.name}.png`, fullPage: true });
  await context.close();
}

await browser.close();
console.log("Final screenshots saved");
