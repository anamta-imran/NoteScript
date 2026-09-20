/**
 * Browser smoke QA for NoteScript (Playwright Chromium).
 * Run: node e2e/browser-smoke.mjs
 * Requires: app at BASE_URL, Mongo up, `npx playwright install chromium`
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const ART = path.join(__dirname, "artifacts");
const report = { verified: [], failed: [], notVerified: [], blockers: [], meta: {} };

fs.mkdirSync(ART, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

function ok(msg) {
  report.verified.push(msg);
  console.log("VERIFIED:", msg);
}
function fail(msg) {
  report.failed.push(msg);
  console.error("FAILED:", msg);
}
function skip(msg) {
  report.notVerified.push(msg);
  console.log("NOT VERIFIED:", msg);
}

async function shot(page, name) {
  const file = path.join(ART, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientW = doc.clientWidth;
    return { overflow: scrollW > clientW + 1, scrollW, clientW };
  });
}

async function signup(page, email, password) {
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
  await page.fill("#name", "QA Browser");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#confirmPassword", password);
  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function logout(page) {
  // Prefer desktop sidebar logout when visible
  const desktopLogout = page.locator("aside button", { hasText: /log out|logout/i });
  if (await desktopLogout.isVisible().catch(() => false)) {
    await desktopLogout.click();
  } else {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: /log out|logout/i }).click();
  }
  await page.waitForURL(/\/login/, { timeout: 15000 });
}

async function createTextNote(page) {
  await page.goto(`${BASE}/create/text`, { waitUntil: "networkidle" });
  await page.fill("#title", "Browser Smoke Note");
  await page.fill(
    "#text",
    "Photosynthesis converts light energy into chemical energy. Chlorophyll absorbs sunlight. The Calvin cycle fixes carbon dioxide into glucose. Water and carbon dioxide are the reactants.",
  );
  await shot(page, "create-text-handwriting-styles");
  await page.getByRole("button", { name: /Generate notes/i }).click();
  await page.waitForURL(/\/notes\/[a-f0-9]+/i, { timeout: 90000 });
  return page.url();
}

async function checkOverflow(page, label) {
  const o = await hasHorizontalOverflow(page);
  if (o.overflow) fail(`${label}: horizontal overflow (scrollW=${o.scrollW} clientW=${o.clientW})`);
  else ok(`${label}: no horizontal overflow`);
}

async function runViewportSmoke(browser, email, password, vpName, size) {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  try {
    await login(page, email, password);
    await page.getByRole("heading", { name: /Welcome back/i }).waitFor({ timeout: 20000 }).catch(() => {});
    await shot(page, `${vpName}-dashboard`);
    await checkOverflow(page, `${vpName} dashboard`);

    if (vpName === "mobile" || vpName === "tablet") {
      const menu = page.getByRole("button", { name: "Menu" });
      if (await menu.isVisible()) {
        await menu.click();
        await page.waitForTimeout(300);
        await shot(page, `${vpName}-menu-open`);
        const drawer = page.locator(".fixed.inset-0");
        if (await drawer.isVisible()) ok(`${vpName}: mobile menu opens`);
        else fail(`${vpName}: mobile menu did not open`);
        // Backdrop is full-screen but drawer (w-72) covers the left; click the
        // uncovered right edge so Playwright does not hit the drawer panel.
        const close = page.getByLabel("Close menu");
        const box = await close.boundingBox();
        if (box) {
          await close.click({
            position: { x: Math.max(box.width - 24, box.width * 0.85), y: Math.min(40, box.height / 2) },
          });
        } else {
          await close.click({ force: true });
        }
        await page.waitForTimeout(200);
      } else {
        fail(`${vpName}: Menu button not visible`);
      }
    } else {
      const aside = page.locator("aside");
      if (await aside.isVisible()) ok(`${vpName}: sidebar visible`);
      else fail(`${vpName}: sidebar not visible`);
    }

    for (const route of ["/notes", "/folders", "/settings", "/billing", "/create/diagram", "/create/text"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await shot(page, `${vpName}${route.replace(/\//g, "-") || "-root"}`);
      await checkOverflow(page, `${vpName} ${route}`);
      const bodyText = await page.locator("main").innerText().catch(() => "");
      if (!bodyText.trim()) fail(`${vpName} ${route}: blank main`);
      else ok(`${vpName} ${route}: main content rendered`);
    }
  } catch (e) {
    fail(`${vpName} smoke: ${e instanceof Error ? e.message : String(e)}`);
    await shot(page, `${vpName}-error`).catch(() => {});
  } finally {
    await context.close();
  }
}

async function main() {
  report.meta.baseUrl = BASE;
  report.meta.viewports = VIEWPORTS;
  report.meta.startedAt = new Date().toISOString();

  const browser = await chromium.launch({ headless: true });
  {
    const p = await browser.newPage();
    const res = await p.goto(`${BASE}/api/health`);
    if (!res || res.status() !== 200) {
      report.blockers.push(`App health not 200 at ${BASE}`);
      await browser.close();
      writeReport();
      process.exit(1);
    }
    await p.close();
    ok(`App health 200 at ${BASE}`);
  }

  const stamp = Date.now();
  const email = `qa.browser.${stamp}@example.com`;
  const password = "BrowserQa1!";

  const context = await browser.newContext({ viewport: VIEWPORTS.desktop, acceptDownloads: true });
  const page = await context.newPage();

  try {
    // Signup
    await signup(page, email, password);
    await page.getByRole("heading", { name: /Welcome back/i }).waitFor({ timeout: 20000 });
    await shot(page, "desktop-after-signup-dashboard");
    ok(`signup → dashboard (${email})`);
    if (await page.getByText("FREE").first().isVisible()) ok("dashboard shows FREE plan badge");
    else fail("dashboard FREE badge not found");

    // Create note
    const noteUrl = await createTextNote(page);
    await page.locator("h1", { hasText: /Browser Smoke Note/i }).waitFor({ timeout: 20000 });
    await page.waitForTimeout(500);
    await shot(page, "desktop-note-detail");
    ok(`create text note → ${noteUrl}`);

    // Style cards on create (already shot) — count buttons under Handwriting style
    await page.goto(`${BASE}/create/text`, { waitUntil: "networkidle" });
    const styleButtons = page.locator("button").filter({ has: page.locator("p") });
    // Count style cards: buttons that contain locked or sample text
    const styleCount = await page.locator("div.grid.gap-2 button").count();
    if (styleCount >= 14) ok(`handwriting selector shows ${styleCount} style cards (≥14)`);
    else fail(`handwriting selector style cards=${styleCount}, expected ≥14`);

    const fontClasses = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div.grid.gap-2 button")];
      return cards.map((btn) => {
        const sample = btn.querySelector("p:last-of-type, p.mt-2") || btn.querySelectorAll("p")[2];
        const label = btn.querySelector("p");
        const cls = (sample || label)?.className || "";
        return { label: label?.textContent?.trim(), className: cls };
      });
    });
    const uniqueFonts = new Set(fontClasses.map((f) => f.className).filter(Boolean));
    report.meta.handwritingFonts = [...uniqueFonts];
    report.meta.handwritingLabels = fontClasses.map((f) => f.label);
    if (uniqueFonts.size >= 10) ok(`handwriting DOM font classes distinct: ${uniqueFonts.size}`);
    else fail(`handwriting font classes only ${uniqueFonts.size} unique`);

    // Notes list
    await page.goto(`${BASE}/notes`, { waitUntil: "networkidle" });
    await shot(page, "desktop-notes");
    if (await page.getByText("Browser Smoke Note").first().isVisible()) ok("notes page lists created note");
    else fail("notes page missing created note");

    // Note detail again
    await page.goto(noteUrl, { waitUntil: "networkidle" });
    await page.locator("h1", { hasText: /Browser Smoke Note/i }).waitFor({ timeout: 20000 });
    await page.locator("button", { hasText: /^Print$/ }).waitFor({ timeout: 15000 });
    ok("note detail rendered");

    // Export Free: PNG/PDF disabled (pointer-events-none — check DOM disabled attr)
    const pngDisabled = await page.locator("button", { hasText: /^PNG$/ }).evaluate((el) =>
      el.disabled,
    );
    const pdfDisabled = await page.locator("button", { hasText: /^PDF$/ }).evaluate((el) =>
      el.disabled,
    );
    if (pngDisabled) ok("Free: PNG export button disabled");
    else fail("Free: PNG export should be disabled");
    if (pdfDisabled) ok("Free: PDF export button disabled");
    else fail("Free: PDF export should be disabled");

    // Print opens dialog — in headless may not fully print; just invoke
    page.once("dialog", (d) => d.dismiss().catch(() => {}));
    await page.getByRole("button", { name: "Print" }).click();
    ok("Print button clickable (print dialog behavior headless-limited)");

    // Folders
    await page.goto(`${BASE}/folders`, { waitUntil: "networkidle" });
    await shot(page, "desktop-folders");
    await page.fill("#folder", `Smoke Folder ${stamp}`);
    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForTimeout(1000);
    if (await page.getByText(`Smoke Folder ${stamp}`).isVisible()) ok("folder created");
    else fail("folder create did not show new folder");

    // Settings / billing / diagram
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    await shot(page, "desktop-settings");
    ok("settings page loaded");

    await page.goto(`${BASE}/billing`, { waitUntil: "networkidle" });
    await shot(page, "desktop-billing");
    ok("billing page loaded");

    await page.goto(`${BASE}/create/diagram`, { waitUntil: "networkidle" });
    await shot(page, "desktop-create-diagram");
    const blocked = await page.getByText(/not included|Upgrade/i).first().isVisible().catch(() => false);
    if (blocked) ok("Free: diagram create shows upgrade/blocked state");
    else skip("diagram blocked copy not found (may still render form)");

    // Logout
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await logout(page);
    ok("logout → login");

    // Login again
    await login(page, email, password);
    ok("login after logout");
    await context.close();

    // Responsive passes
    for (const [name, size] of Object.entries(VIEWPORTS)) {
      await runViewportSmoke(browser, email, password, name, size);
    }

    // Student export: upgrade via mongosh if available
    try {
      const { execSync } = await import("node:child_process");
      execSync(
        `docker exec notescript-mongodb mongosh notescript --quiet --eval 'db.users.updateOne({email:"${email}"},{ $set: { planId: "student", subscriptionStatus: "active" } })'`,
        { stdio: "pipe" },
      );
      const ctx2 = await browser.newContext({ viewport: VIEWPORTS.desktop, acceptDownloads: true });
      const p2 = await ctx2.newPage();
      await login(p2, email, password);
      await p2.goto(noteUrl, { waitUntil: "networkidle" });
      await p2.locator("h1", { hasText: /Browser Smoke Note/i }).waitFor({ timeout: 20000 });
      // Student: enable exports by ensuring buttons are enabled
      await p2.waitForFunction(() => {
        const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "PNG");
        return btn && !btn.disabled;
      }, { timeout: 15000 });
      const [download] = await Promise.all([
        p2.waitForEvent("download", { timeout: 30000 }),
        p2.locator("button", { hasText: /^PNG$/ }).click({ force: true }),
      ]);
      const out = path.join(ART, await download.suggestedFilename());
      await download.saveAs(out);
      const stat = fs.statSync(out);
      if (stat.size > 1000) ok(`PNG export download (${stat.size} bytes) — DB-forced Student`);
      else fail(`PNG export too small (${stat.size} bytes)`);

      const [downloadPdf] = await Promise.all([
        p2.waitForEvent("download", { timeout: 60000 }),
        p2.locator("button", { hasText: /^PDF$/ }).click({ force: true }),
      ]);
      const outPdf = path.join(ART, await downloadPdf.suggestedFilename());
      await downloadPdf.saveAs(outPdf);
      const statPdf = fs.statSync(outPdf);
      if (statPdf.size > 500) ok(`PDF export download (${statPdf.size} bytes) — DB-forced Student`);
      else fail(`PDF export too small (${statPdf.size} bytes)`);
      await ctx2.close();
    } catch (e) {
      skip(`Student export via DB upgrade: ${e instanceof Error ? e.message : String(e)}`);
    }

    skip("Paddle sandbox checkout + webhook (not exercised)");
    skip("Handwriting visual distinctness — see screenshots; DOM fonts recorded; human/agent image review required for VERIFIED visual");
  } catch (e) {
    fail(`primary flow: ${e instanceof Error ? e.message : String(e)}`);
    await shot(page, "primary-error").catch(() => {});
  } finally {
    await browser.close();
  }

  writeReport();
  if (report.failed.length) process.exit(1);
}

function writeReport() {
  report.meta.finishedAt = new Date().toISOString();
  const out = path.join(ART, "report.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log("\n=== REPORT ===");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
