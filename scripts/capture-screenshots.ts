// Capture a screenshot of internal software for use in ScreenRecordingFrame.
//
// Usage:
//   npm run capture -- --url https://internal.company.com/product --out public/screenshots/product.png
//   npm run capture -- --url ... --out ... --width 1600 --height 1000 --full-page
//   npm run capture -- --url ... --out ... --wait-for "[data-testid=dashboard]" --delay 1000
//
// For tools behind SSO/login: sign in once with `npx playwright open <url> --save-storage=auth.json`,
// then pass `--storage-state auth.json` here to reuse that session.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { parseFlags, parseNumberFlag, runCli } from "./cli-utils";

const main = async () => {
  const { flags, bools } = parseFlags(process.argv.slice(2));

  if (!flags.url || !flags.out) {
    console.error(
      "Usage: npm run capture -- --url <url> --out <path> [--width 1600] [--height 1000] [--full-page] [--wait-for <selector>] [--delay <ms>] [--storage-state <path>]",
    );
    process.exit(1);
  }

  const width = parseNumberFlag(flags.width, "width") ?? 1600;
  const height = parseNumberFlag(flags.height, "height") ?? 1000;
  const delay = parseNumberFlag(flags.delay, "delay");

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      storageState: flags["storage-state"],
    });
    const page = await context.newPage();

    console.log(`Navigating to ${flags.url}...`);
    await page.goto(flags.url, { waitUntil: "networkidle" });

    if (flags["wait-for"]) {
      await page.waitForSelector(flags["wait-for"]);
    }
    if (delay !== undefined) {
      await page.waitForTimeout(delay);
    }

    fs.mkdirSync(path.dirname(flags.out), { recursive: true });
    await page.screenshot({ path: flags.out, fullPage: bools.has("full-page") });
  } finally {
    await browser.close();
  }

  console.log(`Saved screenshot to ${flags.out}`);
};

runCli(main);
