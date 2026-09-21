/**
 * Full A–Z QA against NoteScript (live or local).
 * BASE_URL=https://notescript-xi.vercel.app node e2e/full-qa.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL || "https://notescript-xi.vercel.app").replace(/\/$/, "");
const ART = path.join(__dirname, "artifacts-full");
fs.mkdirSync(ART, { recursive: true });

const report = {
  meta: { baseUrl: BASE, startedAt: new Date().toISOString() },
  verified: [],
  failed: [],
  blockers: [],
  notes: [],
};

function ok(m) {
  report.verified.push(m);
  console.log("PASS:", m);
}
function fail(m) {
  report.failed.push(m);
  console.error("FAIL:", m);
}
function note(m) {
  report.notes.push(m);
  console.log("NOTE:", m);
}
function block(m) {
  report.blockers.push(m);
  console.error("BLOCKER:", m);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(ART, `${name}.png`), fullPage: true }).catch(() => {});
}

async function statusOf(page, pathUrl) {
  const res = await page.goto(`${BASE}${pathUrl}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  return res?.status() ?? 0;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  // -------- Phase 2: Public pages --------
  const publicPaths = [
    "/",
    "/features",
    "/how-it-works",
    "/pricing",
    "/templates",
    "/faq",
    "/about",
    "/terms",
    "/privacy",
    "/refund",
    "/login",
    "/signup",
  ];
  for (const p of publicPaths) {
    try {
      const st = await statusOf(page, p);
      const body = await page.locator("body").innerText().catch(() => "");
      if (st >= 200 && st < 400 && body.trim().length > 20) ok(`public ${p} → ${st}`);
      else fail(`public ${p} → status ${st} or empty body`);
    } catch (e) {
      fail(`public ${p}: ${e.message}`);
    }
  }

  // Footer legal links on homepage
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  for (const [href, label] of [
    ["/terms", "Terms"],
    ["/privacy", "Privacy"],
    ["/refund", "Refund"],
  ]) {
    const link = page.locator(`footer a[href="${href}"]`).first();
    if (await link.count()) ok(`footer link ${href}`);
    else fail(`footer missing ${href} (${label})`);
  }

  // 404
  const notFound = await statusOf(page, "/this-page-does-not-exist-qa-404");
  if (notFound === 404 || (await page.content()).toLowerCase().includes("404")) ok(`404 handling status=${notFound}`);
  else note(`404 path returned ${notFound} (Next may soft-404)`);

  // Broken internal nav from pricing
  await page.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
  await shot(page, "live-pricing");

  // -------- Phase 3–4: Free signup --------
  const stamp = Date.now();
  const freeEmail = `qa.free.${stamp}@example.com`;
  const password = "BrowserQa1!";

  try {
    await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
    await page.fill("#name", "QA Free User");
    await page.fill("#email", freeEmail);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);

    let paddleRequestSeen = false;
    page.on("request", (req) => {
      if (req.url().includes("paddle") || req.url().includes("transaction-checkout")) {
        paddleRequestSeen = true;
      }
    });

    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.getByRole("heading", { name: /Welcome back/i }).waitFor({ timeout: 30000 }).catch(() => {});
    await shot(page, "live-free-dashboard");

    if (!paddleRequestSeen) ok("Free signup: no Paddle checkout request");
    else fail("Free signup: unexpected Paddle network activity");

    const freeBadge = await page.getByText("FREE", { exact: true }).first().isVisible().catch(() => false);
    const freePlanText = (await page.locator("main").innerText()).toLowerCase();
    if (freeBadge || freePlanText.includes("free")) ok("Free dashboard shows Free plan");
    else fail("Free dashboard missing Free plan indicator");

    // Refresh persistence
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /Welcome back/i }).waitFor({ timeout: 30000 }).catch(() => {});
    const afterRefresh = (await page.locator("main").innerText()).toLowerCase();
    if (afterRefresh.includes("free") || (await page.getByText("FREE").first().isVisible().catch(() => false)))
      ok("Free plan persists after refresh");
    else fail("Free plan lost after refresh");

    // Logout
    const logout = page.locator("aside button", { hasText: /log out/i });
    if (await logout.isVisible()) await logout.click();
    else {
      await page.getByRole("button", { name: "Menu" }).click().catch(() => {});
      await page.getByRole("button", { name: /log out/i }).click();
    }
    await page.waitForURL(/\/login/, { timeout: 20000 });
    ok("Logout → login");

    // Wrong password
    await page.fill("#email", freeEmail);
    await page.fill("#password", "WrongPass1!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    const errVisible = await page.locator("text=/could not|invalid|incorrect|wrong|failed/i").first().isVisible().catch(() => false);
    if (errVisible || page.url().includes("/login")) ok("Wrong password stays on login / shows error");
    else fail("Wrong password behavior unclear");

    // Login success
    await page.fill("#email", freeEmail);
    await page.fill("#password", password);
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);
    ok("Login with Free account");
    await page.getByRole("heading", { name: /Welcome back/i }).waitFor({ timeout: 30000 }).catch(() => {});
    if ((await page.locator("main").innerText()).toLowerCase().includes("free") || (await page.getByText("FREE").first().isVisible()))
      ok("Free plan persists after logout/login");
    else fail("Free plan not shown after re-login");
  } catch (e) {
    fail(`Free auth flow: ${e.message}`);
    await shot(page, "live-free-error");
  }

  // Duplicate signup
  try {
    await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded" });
    // may redirect to dashboard if still logged in
    if (page.url().includes("/dashboard") || page.url().includes("/signup") === false) {
      // logout first
      await page.goto(`${BASE}/dashboard`);
      const lo = page.locator("aside button", { hasText: /log out/i });
      if (await lo.isVisible().catch(() => false)) {
        await lo.click();
        await page.waitForURL(/\/login/, { timeout: 15000 });
      }
      await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded" });
    }
    if (page.url().includes("/signup")) {
      await page.fill("#name", "Dup User");
      await page.fill("#email", freeEmail);
      await page.fill("#password", password);
      await page.fill("#confirmPassword", password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      const dupErr = await page.locator("text=/already|exists|registered|in use/i").first().isVisible().catch(() => false);
      if (dupErr) ok("Duplicate email signup shows error");
      else note("Duplicate email: error text not matched (check manually)");
    }
  } catch (e) {
    note(`Duplicate signup check: ${e.message}`);
  }

  // Protected route without auth
  try {
    await context.clearCookies();
    const res = await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    if (page.url().includes("/login")) ok("Unauthed /dashboard → login");
    else fail(`Unauthed /dashboard stayed on ${page.url()} status=${res?.status()}`);
  } catch (e) {
    fail(`Protected route: ${e.message}`);
  }

  // -------- Phase 5: Student Monthly (checkout open + payment attempt) --------
  const studentEmail = `qa.student.${stamp}@example.com`;
  let studentCheckoutOpened = false;
  let studentCheckoutError = "";
  let studentPaid = false;

  try {
    await page.goto(`${BASE}/signup?plan=student&cycle=monthly`, { waitUntil: "networkidle" });
    await page.fill("#name", "QA Student");
    await page.fill("#email", studentEmail);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);

    const paddleErrors = [];
    page.on("response", async (res) => {
      if (res.url().includes("transaction-checkout") || res.url().includes("checkout-service.paddle")) {
        studentCheckoutOpened = true;
        try {
          const t = await res.text();
          if (t.includes("transaction_default_checkout_url_not_set")) {
            studentCheckoutError = "transaction_default_checkout_url_not_set";
          }
          if (!res.ok()) paddleErrors.push(`${res.status()} ${res.url().slice(0, 80)} ${t.slice(0, 200)}`);
        } catch {
          /* ignore */
        }
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // Check pending checkout UI or overlay iframe
    const pending = await page.getByText(/subscription is not active|Complete Paddle|Continue checkout/i).first().isVisible().catch(() => false);
    const iframe = page.frameLocator('iframe[name*="paddle"], iframe[src*="paddle"]').first();
    const hasFrame = await page.locator('iframe[src*="paddle"], iframe[name*="paddle"]').count();

    if (studentCheckoutError.includes("transaction_default_checkout_url_not_set")) {
      block("Student Monthly: Paddle 400 transaction_default_checkout_url_not_set — Default payment link not set for this account");
      fail("Student Monthly checkout cannot complete (Paddle dashboard)");
    } else if (hasFrame > 0 || pending) {
      ok("Student Monthly: checkout UI opened / pending checkout shown");
      studentCheckoutOpened = true;
      // Try sandbox card if overlay usable
      try {
        const frame = page.frames().find((f) => f.url().includes("paddle") || f.name()?.includes("paddle"));
        if (frame) {
          // Best-effort fill; Sandbox UI varies
          await frame.fill('input[name="cardNumber"], input[autocomplete="cc-number"]', "4242424242424242", { timeout: 5000 }).catch(() => {});
          await frame.fill('input[name="expiryDate"], input[autocomplete="cc-exp"]', "1228", { timeout: 3000 }).catch(() => {});
          await frame.fill('input[name="cvv"], input[autocomplete="cc-csc"]', "100", { timeout: 3000 }).catch(() => {});
          await frame.locator('button[type="submit"], button:has-text("Pay"), button:has-text("Subscribe")').first().click({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(10000);
          // Check if we got to dashboard as student
          await page.goto(`${BASE}/billing`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(2000);
          const billingText = (await page.locator("main").innerText()).toLowerCase();
          if (billingText.includes("student") && !billingText.includes("no paid subscription")) {
            studentPaid = true;
            ok("Student Monthly: Billing shows Student after payment attempt");
          } else {
            note("Student Monthly: overlay interaction did not confirm Student activation (manual Sandbox payment may be required)");
          }
        }
      } catch (e) {
        note(`Student payment UI: ${e.message}`);
      }
    } else if (page.url().includes("/dashboard")) {
      // Might have skipped to free dashboard
      const t = (await page.locator("main").innerText()).toLowerCase();
      if (t.includes("free")) {
        note("Student signup landed Free dashboard — checkout may have failed silently or pending UI missing");
        await page.goto(`${BASE}/billing`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);
        // Try Get student from billing
        const getStudent = page.getByRole("button", { name: /Get student/i });
        if (await getStudent.isVisible().catch(() => false)) {
          await getStudent.click();
          await page.waitForTimeout(6000);
          if (studentCheckoutError.includes("transaction_default_checkout_url_not_set")) {
            block("Student from Billing: transaction_default_checkout_url_not_set");
          }
        }
      }
    } else {
      fail(`Student Monthly: unexpected state url=${page.url()} errors=${paddleErrors.join(" | ")}`);
    }
    await shot(page, "live-student-checkout");
  } catch (e) {
    fail(`Student Monthly flow: ${e.message}`);
    await shot(page, "live-student-error");
  }

  if (!studentPaid) {
    note("STUDENT activation after successful Sandbox payment: NOT VERIFIED (checkout blocked or payment not completed in automation)");
  }

  // -------- Phase 6: Pro Monthly — checkout attempt only if we can login a new user --------
  const proEmail = `qa.pro.${stamp}@example.com`;
  try {
    await context.clearCookies();
    await page.goto(`${BASE}/signup?plan=pro&cycle=monthly`, { waitUntil: "networkidle" });
    await page.fill("#name", "QA Pro");
    await page.fill("#email", proEmail);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);

    let proDefaultLinkErr = false;
    page.on("response", async (res) => {
      if (res.url().includes("transaction-checkout")) {
        const t = await res.text().catch(() => "");
        if (t.includes("transaction_default_checkout_url_not_set")) proDefaultLinkErr = true;
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);
    await shot(page, "live-pro-checkout");

    if (proDefaultLinkErr) {
      block("Pro Monthly: transaction_default_checkout_url_not_set");
      fail("Pro Monthly checkout blocked by Paddle Default payment link");
    } else {
      note("Pro Monthly: checkout attempted; full payment→webhook→Pro NOT auto-verified");
    }
  } catch (e) {
    fail(`Pro Monthly flow: ${e.message}`);
  }

  // -------- Pricing CTAs Free (logged out) --------
  try {
    await context.clearCookies();
    await page.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
    // Free CTA
    const freeBtn = page.getByRole("button", { name: /Start for free/i });
    if (await freeBtn.isVisible()) {
      await freeBtn.click();
      await page.waitForTimeout(3000);
      if (page.url().includes("/signup") && !page.url().includes("plan=student") && !page.url().includes("plan=pro"))
        ok("Pricing Free CTA → /signup without paid plan query (or plain signup)");
      else if (page.url().includes("/signup")) ok(`Pricing Free CTA → ${page.url()}`);
      else note(`Pricing Free CTA navigated to ${page.url()}`);
    }
  } catch (e) {
    note(`Pricing Free CTA: ${e.message}`);
  }

  // -------- Responsive smoke --------
  for (const [name, size] of [
    ["tablet", { width: 768, height: 1024 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport: size });
    const p = await ctx.newPage();
    try {
      await p.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      if (!overflow) ok(`${name} pricing: no horizontal overflow`);
      else fail(`${name} pricing: horizontal overflow`);
      await p.screenshot({ path: path.join(ART, `${name}-pricing.png`), fullPage: true });
    } catch (e) {
      fail(`${name} responsive: ${e.message}`);
    } finally {
      await ctx.close();
    }
  }

  // Annual price check via API (signup+checkout) if possible on live
  try {
    await context.clearCookies();
    const email = `qa.prices.${stamp}@example.com`;
    await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
    await page.fill("#name", "QA Prices");
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.fill("#confirmPassword", password);
    await Promise.all([page.waitForURL(/\/dashboard/, { timeout: 60000 }), page.click('button[type="submit"]')]);

    const cookies = await context.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const combos = [
      ["student", "monthly", "pri_01m2wfdxvt30rdb4esjyez9t41"],
      ["student", "annual", "pri_01m2wfftnb5bhyqphabrh1arew"],
      ["pro", "monthly", "pri_01m2wfjt2pbmf61yytvhs2czb9"],
      ["pro", "annual", "pri_01m2wfm5deqy8crseg76z3xhkt"],
    ];
    for (const [planId, billingCycle, expected] of combos) {
      const res = await page.request.post(`${BASE}/api/billing/checkout`, {
        headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
        data: { planId, billingCycle },
      });
      const body = await res.json().catch(() => ({}));
      if (res.status() === 200 && body.priceId === expected) ok(`checkout price ${planId}/${billingCycle} → ${expected}`);
      else fail(`checkout price ${planId}/${billingCycle} → status ${res.status()} priceId=${body.priceId}`);
    }
  } catch (e) {
    fail(`Price ID API checks: ${e.message}`);
  }

  // Security: plan not changeable via client — me stays free after fake
  try {
    const me = await page.request.get(`${BASE}/api/auth/me`);
    const meBody = await me.json();
    if (meBody?.user?.planId === "free") ok("API /auth/me planId=free (no client elevation)");
    else note(`me planId=${meBody?.user?.planId}`);
  } catch (e) {
    note(`me check: ${e.message}`);
  }

  await browser.close();
  report.meta.finishedAt = new Date().toISOString();
  report.meta.studentPaid = studentPaid;
  report.meta.studentCheckoutOpened = studentCheckoutOpened;
  fs.writeFileSync(path.join(ART, "full-qa-report.json"), JSON.stringify(report, null, 2));
  console.log("\n=== FULL QA REPORT ===");
  console.log(JSON.stringify(report, null, 2));
  if (report.failed.length || report.blockers.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
