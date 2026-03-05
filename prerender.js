import puppeteer from 'puppeteer';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 5174;
const DIST_DIR = join(__dirname, 'dist', 'public');

const routes = [
    '/',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/commodity-lookup',
    '/bol-generator',
    '/pallet-optimizer'
];

async function prerender() {
    console.log('Starting prerendering process...');

    // Start static server
    const app = express();
    app.use(express.static(DIST_DIR));

    // SPA Fallback for local server
    app.get('*', (req, res) => {
        res.sendFile(join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(PORT, () => {
        console.log(`Static server running on http://localhost:${PORT}`);
    });

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        for (const route of routes) {
            console.log(`Prerendering route: ${route}`);

            const url = `http://localhost:${PORT}${route}`;
            await page.goto(url, { waitUntil: 'networkidle0' });

            const html = await page.evaluate(() => {
                return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
            });

            // Write HTML to the correct subfolder
            const routeDir = join(DIST_DIR, route);

            // Ensure the directory exists (e.g., /faq)
            if (route !== '/') {
                if (!existsSync(routeDir)) {
                    await fs.mkdir(routeDir, { recursive: true });
                }
                await fs.writeFile(join(routeDir, 'index.html'), html);
            } else {
                await fs.writeFile(join(DIST_DIR, 'index.html'), html);
            }

            console.log(`✅ Saved ${route}`);
        }

        await browser.close();
        console.log('Prerendering complete!');
    } catch (err) {
        console.error('Error during prerendering:', err);
        process.exit(1);
    } finally {
        server.close();
    }
}

prerender();
