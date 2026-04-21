// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Helper: save a screenshot with a descriptive name
async function snap(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
}

async function snapFullPage(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function snapElement(page, selector, name) {
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
  });
}

// ---------------------------------------------------------------------------
// Desktop tests (1280x720 project)
// ---------------------------------------------------------------------------
test.describe('Desktop screenshots', () => {

  test('01 - Homepage full page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapFullPage(page, '01-homepage-full');
  });

  test('02 - Homepage hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapElement(page, 'header', '02-homepage-hero');
  });

  test('03 - Homepage about section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapElement(page, '#about', '03-homepage-about');
  });

  test('04 - Homepage projects section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for GitHub API projects to load or fallback to render
    await page.waitForTimeout(2000);
    await snapElement(page, '#projects', '04-homepage-projects');
  });

  test('05 - Homepage demos section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapElement(page, '#demos', '05-homepage-demos');
  });

  test('06 - Homepage footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapElement(page, 'footer', '06-homepage-footer');
  });

  test('07 - Homepage contact section', async ({ page }) => {
    // Chat widget is currently disabled; this slot now captures the
    // Contact section added in its place.
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapElement(page, '#contact', '07-homepage-contact');
  });

  test('08 - 404 page', async ({ page }) => {
    await page.goto('/404.html');
    await page.waitForLoadState('networkidle');
    await snapFullPage(page, '08-404-page');
  });

  test('09 - Demos page', async ({ page }) => {
    await page.goto('/demos/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await snapFullPage(page, '09-demos-page');
  });

  test('10 - Wiki home page', async ({ page }) => {
    await page.goto('/wiki/');
    // Docsify renders client-side, wait for main content
    await page.waitForSelector('#main', { timeout: 10000 });
    await page.waitForTimeout(1000);
    // Assert the chat widget / cookie popup is NOT in the DOM
    expect(await page.locator('#chat-widget').count()).toBe(0);
    expect(await page.locator('#cookie-consent-message').count()).toBe(0);
    await snapFullPage(page, '10-wiki-page');
  });

  test('10b - Wiki project page (CrumbGuard)', async ({ page }) => {
    await page.goto('/wiki/#/projects/CrumbGuard');
    await page.waitForSelector('#main', { timeout: 10000 });
    await page.waitForTimeout(1500); // alias routes fetch from GitHub
    await snapFullPage(page, '10b-wiki-crumbguard');
  });

  test('10c - Wiki sidebar', async ({ page }) => {
    await page.goto('/wiki/');
    await page.waitForSelector('.sidebar', { timeout: 10000 });
    await page.waitForTimeout(500);
    await snapElement(page, '.sidebar', '10c-wiki-sidebar');
  });

  test('11 - Security dashboard', async ({ page }) => {
    await page.goto('/tools/security-dashboard/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await snapFullPage(page, '11-security-dashboard');
  });

  test('15 - Navbar shrunk state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Scroll down to trigger navbar shrink via agency.js
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    // Verify the navbar has the shrink class
    const navbar = page.locator('nav.navbar');
    await expect(navbar).toHaveClass(/navbar-shrink/);
    await snapElement(page, 'nav.navbar', '15-navbar-shrunk');
  });
});

// ---------------------------------------------------------------------------
// Mobile tests (375x667 project)
// ---------------------------------------------------------------------------
test.describe('Mobile screenshots', () => {

  test('12 - Homepage mobile full page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await snapFullPage(page, '12-homepage-mobile');
  });

  test('13 - Mobile nav open', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Click the hamburger menu
    await page.click('.navbar-toggler');
    await page.waitForTimeout(500);
    await snap(page, '13-mobile-nav-open');
  });

  test('14 - 404 mobile', async ({ page }) => {
    await page.goto('/404.html');
    await page.waitForLoadState('networkidle');
    await snapFullPage(page, '14-404-mobile');
  });
});
