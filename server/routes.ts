import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "node:fs";
import path from "node:path";
import { storage } from "./storage";

function readCommodities(): any[] {
  try {
    const p = path.resolve(import.meta.dirname, "..", "client", "src", "data", "commodities.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Machine-readable endpoints for search + AI citations. No PII. CORS open for GET.
  // Express + Drizzle kept for future accounts/saved calculations; calculator stays client-side.
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "freightclasspro", time: new Date().toISOString() });
  });

  app.get("/api/commodities", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({
      updated: "2026-09-01",
      disclaimer:
        "Estimate-only typical classes/densities. Actual class depends on measured density, NMFC, packaging, handling. Confirm with carrier.",
      count: readCommodities().length,
      data: readCommodities(),
    });
  });

  app.get("/api/guides", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({
      updated: "2026-09-01",
      guides: [
        {
          slug: "how-to-calculate-freight-density",
          title: "How to Calculate Freight Density (PCF) — Step-by-Step",
          url: "https://freightclasspro.com/guides/how-to-calculate-freight-density",
        },
        {
          slug: "how-to-avoid-reclassification-fees",
          title: "How to Avoid LTL Re-Classification Fees",
          url: "https://freightclasspro.com/guides/how-to-avoid-reclassification-fees",
        },
        {
          slug: "pallet-dimensions-weight-guide",
          title: "Pallet Dimensions & Weight Guide (48×40, 48×48, EUR)",
          url: "https://freightclasspro.com/guides/pallet-dimensions-weight-guide",
        },
      ],
    });
  });

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
