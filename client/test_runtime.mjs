import { firefox } from 'playwright';

const APP_URL = 'http://127.0.0.1:5173';

async function captureErrors(page, label) {
  const errors = [];
  page.on('pageerror', err => errors.push({ type: 'page', msg: err.message, stack: err.stack }));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console', msg: msg.text() });
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push({ type: 'response', url: response.url(), status: response.status() });
    }
  });
  return errors;
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: [],
  });

  // Clear any existing state
  await context.clearCookies();
  await context.addInitScript(() => {
    localStorage.clear();
    indexedDB.deleteDatabase('AttendanceRegister');
  });

  const page = await context.newPage();
  const allErrors = [];

  // Listen for all errors
  page.on('pageerror', err => {
    allErrors.push({ page: page.url(), type: 'RUNTIME', msg: err.message, stack: err.stack });
    console.error('=== RUNTIME ERROR ===');
    console.error(`URL: ${page.url()}`);
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push({ page: page.url(), type: 'CONSOLE', msg: msg.text() });
      console.error('=== CONSOLE ERROR ===');
      console.error(`URL: ${page.url()}`);
      console.error(`Message: msg.text()`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`=== HTTP ERROR === ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Navigate to app URL
    console.log('\n--- Navigating to', APP_URL, '---');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: 'screenshot-login.png' });
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Check if we're on the login page
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('Login form found - app requires authentication');
      console.log('Cannot proceed with auth flow without credentials.');
      console.log('Checking if there are any non-auth pages or errors...');
    }

    // Try navigating directly to pages (will redirect to login, but should not crash)
    const pages = ['/students', '/settings', '/attendance/new', '/history', '/reports'];
    for (const path of pages) {
      console.log(`\n--- Navigating to ${path} ---`);
      try {
        await page.goto(`${APP_URL}${path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.screenshot({ path: `screenshot-${path.replace('/', '')}.png` });
        console.log('URL after navigation:', page.url());

        // Check for visible errors
        const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'EMPTY BODY');
        console.log('Page content (first 500 chars):', bodyText.substring(0, 200));

        const errorElements = await page.$$('.text-danger, [class*="error"], [role="alert"]');
        console.log('Error elements found:', errorElements.length);
      } catch (navErr) {
        console.error(`Navigation error to ${path}:`, navErr.message);
      }
    }

    // Try to log in if we have credentials from env
    // (won't work without actual credentials)
    console.log('\n--- Checking for stored sessions ---');
    const hasSession = await page.evaluate(() => {
      return document.cookie.includes('sb-') || document.cookie.includes('supabase');
    });
    console.log('Has session cookie:', hasSession);

  } catch (err) {
    console.error('Fatal error:', err.message);
    console.error(err.stack);
  }

  console.log('\n=== ALL ERRORS CAPTURED ===');
  if (allErrors.length === 0) {
    console.log('No errors detected!');
  } else {
    for (const e of allErrors) {
      console.log(JSON.stringify(e, null, 2));
    }
  }

  await browser.close();
}

run().catch(console.error);
