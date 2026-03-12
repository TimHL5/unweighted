const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to app...');
    await page.goto('http://localhost:3000/login');

    console.log('Logging in...');
    await page.fill('input[type="email"]', 'test@example.com'); // assuming test user exists or we can sign up
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    if (page.url().includes('login')) {
        console.log('Login failed or not test user. Trying signup...');
        await page.goto('http://localhost:3000/signup');
        await page.fill('input[name="display_name"]', 'Test User');
        await page.fill('input[type="email"]', 'test_playwright@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
    }

    console.log('Navigating to weight progress...');
    await page.goto('http://localhost:3000/dashboard/progress');
    await page.waitForTimeout(2000);

    console.log('Clicking Log Weight...');
    await page.click('text="Log Weight"');
    await page.waitForTimeout(1000);

    console.log('Filling weight...');
    await page.fill('input[placeholder="0.0"]', '75.5');

    console.log('Listening for request...');
    page.on('request', request => {
        if (request.url().includes('/api/weight') && request.method() === 'POST') {
            console.log('=> POST /api/weight captured!');
        }
    });

    console.log('Clicking Save Weight...');
    await page.click('button:has-text("Save Weight")');
    await page.waitForTimeout(2000);

    console.log('Done testing weight logging.');
    await browser.close();
})();
