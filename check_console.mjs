import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Capture console messages
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', err => {
        console.log(`[Browser PAGE ERROR] ${err.toString()}`);
    });

    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
        console.log('[Puppeteer] Page loaded successfully.');
    } catch (err) {
        console.log('[Puppeteer] Navigation error:', err);
    }

    await browser.close();
})();
