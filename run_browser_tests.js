
import puppeteer from 'puppeteer';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBrowserTests() {
    const app = express();
    app.use(express.static(path.join(__dirname)));
    const server = http.createServer(app);
    const port = 8889;

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });

    let browser;
    try {
        console.log("Launching browser...");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
        page.on('requestfailed', request => console.error(`REQUEST FAILED: ${request.url()}`));
        page.on('response', response => {
            if (!response.ok()) {
                console.error(`FAILED RESPONSE: ${response.url()} ${response.status()} ${response.statusText()}`);
            }
        });


        console.log(`Navigating to test page at http://localhost:${port}/test.html`);
        await page.goto(`http://localhost:${port}/test.html`, { waitUntil: 'networkidle0' });

        // Wait for Mocha to finish
        await page.waitForSelector('#mocha-stats', { timeout: 30000 });

        const failures = await page.evaluate(() => {
            const failuresElement = document.querySelector('#mocha-stats .failures');
            if (failuresElement) {
                return parseInt(failuresElement.innerText, 10);
            }
            return 0;
        });

        if (failures > 0) {
            console.error(`${failures} test(s) failed.`);
            const report = await page.evaluate(() => document.getElementById('mocha-report').innerText);
            console.error(report);
        } else {
            console.log("All tests passed!");
        }

        console.log("Tests finished.");

    } catch (error) {
        console.error("Error running browser tests:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
        server.close();
    }
}

runBrowserTests();
