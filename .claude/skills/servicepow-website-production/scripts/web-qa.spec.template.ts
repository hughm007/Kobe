// Playwright battery template — RENDERED web gates (BC-44 overflow, BC-47 axe, console errors).
// Copy into the site repo's e2e dir; requires @playwright/test + @axe-core/playwright.
// Reference implementation proven on the Service Pow site (9/9, incl. 2 real contrast fixes).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const ROUTES: string[] = ['/'];            // fill with the site's page inventory
const WIDTHS = [320, 375, 390, 768, 1024, 1440];  // BC-44 width battery

for (const route of ROUTES) {
  test.describe(`route ${route}`, () => {
    for (const w of WIDTHS) {
      test(`BC-44 no horizontal overflow @${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(BASE + route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `scrollWidth exceeds clientWidth by ${overflow}px`).toBeLessThanOrEqual(0);
      });
    }
    test('BC-45 zero console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      expect(errors, errors.join('\n')).toHaveLength(0);
    });
    test('BC-47 axe: zero serious/critical', async ({ page }) => {
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).analyze();
      const bad = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''));
      expect(bad.map(v => `${v.id}: ${v.help}`), 'serious/critical a11y violations').toHaveLength(0);
    });
  });
}
