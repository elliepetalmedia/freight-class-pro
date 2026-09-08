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
    '/pallet-optimizer',
    '/guides',
    '/guides/how-to-calculate-freight-density',
    '/guides/how-to-avoid-reclassification-fees',
    '/guides/pallet-dimensions-weight-guide',
    // Top-traffic commodity detail pages (hub covers the full 50+ via client search)
    '/commodity/computer-equipment-boxed',
    '/commodity/couches-sofas',
    '/commodity/mattresses',
    '/commodity/canned-goods',
    '/commodity/bottled-beverages-water-soda',
    '/commodity/industrial-machinery-lathes',
    '/commodity/clothing-in-boxes-cartons',
    '/commodity/copy-paper-cartons',
    '/commodity/lumber-wood-boards',
    '/commodity/bricks-pavers',
    '/commodity/engines-crated',
    '/commodity/tires',
];

function slugify(input) {
    return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

async function buildApiAndSitemap() {
    // Static API snapshots for Netlify (Express /api/* takes precedence on Node deploys)
    const srcCommodities = join(__dirname, 'client', 'src', 'data', 'commodities.json');
    const apiDir = join(DIST_DIR, 'api');
    await fs.mkdir(apiDir, { recursive: true });
    try {
        const raw = await fs.readFile(srcCommodities, 'utf-8');
        const data = JSON.parse(raw);
        await fs.writeFile(join(apiDir, 'commodities.json'), JSON.stringify({
            updated: new Date().toISOString().slice(0, 10),
            disclaimer: 'Estimate-only typical classes/densities. Actual class depends on measured density, NMFC, packaging, handling. Confirm with carrier.',
            count: data.length,
            data,
        }, null, 2));
        // Also expose at /api/commodities (no extension) for llms.txt consumers on static hosts
        await fs.writeFile(join(apiDir, 'commodities'), JSON.stringify({ count: data.length, data }));
    } catch (e) {
        console.warn('Could not snapshot commodities API:', e.message);
    }
    const guides = [
        { slug: 'how-to-calculate-freight-density', title: 'How to Calculate Freight Density (PCF) — Step-by-Step', url: 'https://freightclasspro.com/guides/how-to-calculate-freight-density' },
        { slug: 'how-to-avoid-reclassification-fees', title: 'How to Avoid LTL Re-Classification Fees', url: 'https://freightclasspro.com/guides/how-to-avoid-reclassification-fees' },
        { slug: 'pallet-dimensions-weight-guide', title: 'Pallet Dimensions & Weight Guide (48×40, 48×48, EUR)', url: 'https://freightclasspro.com/guides/pallet-dimensions-weight-guide' },
    ];
    await fs.writeFile(join(apiDir, 'guides.json'), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), guides }, null, 2));

    // Regenerate sitemap with current date + all prerendered routes
    const today = new Date().toISOString().slice(0, 10);
    const priority = (r) => r === '/' ? '1.0' : r.startsWith('/guides/') || r.startsWith('/commodity/') ? '0.7' : r === '/faq' || r === '/commodity-lookup' || r === '/bol-generator' || r === '/pallet-optimizer' || r === '/guides' ? '0.8' : '0.5';
    const urls = routes.map((r) => `  <url>\n    <loc>https://freightclasspro.com${r === '/' ? '/' : r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority(r)}</priority>\n  </url>`).join('\n');
    await fs.writeFile(join(DIST_DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    console.log(`✅ Sitemap + API snapshots written (${routes.length} routes)`);
}

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
            // Allow lazy chunks + useSEO effects to settle
            await new Promise((r) => setTimeout(r, 600));

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
        await buildApiAndSitemap();
        console.log('Prerendering complete!');
    } catch (err) {
        console.error('Error during prerendering:', err);
        process.exit(1);
    } finally {
        server.close();
    }
}

prerender();
