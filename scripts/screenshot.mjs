import { chromium } from "playwright";

const url = process.env.URL || "http://localhost:3000";
const outDir = process.env.OUT || "screenshots";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: vp,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve(undefined);
        }
      }, 50);
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/homepage-${vp.name}.png`, fullPage: true });
  console.log(`Saved ${outDir}/homepage-${vp.name}.png`);
  await context.close();
}
await browser.close();
