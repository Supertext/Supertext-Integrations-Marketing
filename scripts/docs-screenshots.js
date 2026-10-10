// Screenshots for docs/images from a locally running CMS (1337) and website (3000).
// Usage: npm i -g playwright && npx playwright install chromium
//        DEMO_ADMIN_EMAIL=… DEMO_ADMIN_PASSWORD=… STRAPI_API_TOKEN=… node scripts/docs-screenshots.js
const { chromium } = require('playwright');
const path = require('path');

const WEB = process.env.WEB_URL || 'http://localhost:3000';
const CMS = process.env.CMS_URL || 'http://localhost:1337';
const out = (name) => path.join(__dirname, '..', 'docs', 'images', name);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });

  await page.goto(`${WEB}/en`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out('home.png') });
  await page.goto(`${WEB}/en/pricing`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out('pricing.png'), clip: { x: 0, y: 380, width: 1280, height: 780 } });
  await page.goto(`${WEB}/en/integrations/strapi`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out('integration.png') });

  if (process.env.DEMO_ADMIN_EMAIL) {
    await page.goto(`${CMS}/admin/auth/login`);
    await page.fill('input[name=email]', process.env.DEMO_ADMIN_EMAIL);
    await page.fill('input[name=password]', process.env.DEMO_ADMIN_PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForURL(/admin(?!\/auth)/);
    const res = await page.request.get(`${CMS}/api/pages?filters[slug][$eq]=pricing&fields[0]=slug`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    });
    const id = (await res.json()).data?.[0]?.documentId;
    await page.goto(`${CMS}/admin/content-manager/collection-types/api::page.page/${id}?plugins[i18n][locale]=en`);
    await page.waitForTimeout(4000);
    await page.keyboard.press('Escape');
    await page.screenshot({ path: out('edit-blocks.png') });
    await page.getByRole('link', { name: /preview/i }).first().click();
    await page.waitForTimeout(6000);
    await page.screenshot({ path: out('preview.png') });
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
