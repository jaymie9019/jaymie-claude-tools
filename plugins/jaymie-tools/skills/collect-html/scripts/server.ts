#!/usr/bin/env bun
/**
 * collect-html panel backend (phase 2).
 *
 * Serves ~/collect-html statically (following symlinks to real project files)
 * and exposes the two mutating endpoints the index.html buttons call:
 *   POST /api/archive?id=<id>   disposition -> archived
 *   POST /api/delete?id=<id>    unlink + drop the manifest entry
 *                               (NEVER rm the real project file)
 *
 * Run natively (simplest — symlinks resolve, no mounts):
 *   bun server.ts            # http://localhost:4321
 * Or in Docker + OrbStack for a nice domain — see SETUP.md.
 *
 * SAFETY: delete is unlink-only — this server never touches a file under the
 * symlink target. The mutating API is meant for localhost; do not expose it.
 */
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { loadManifest, saveManifest, regenIndex, ROOT, LINKS } from "./collect-html.ts";

const PORT = Number(process.env.COLLECT_HTML_PORT ?? 4321);

Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // --- mutating API ---
    if (req.method === "POST" && url.pathname.startsWith("/api/")) {
      const id = url.searchParams.get("id") ?? "";
      const act = url.pathname.slice("/api/".length);
      const entries = await loadManifest();
      const entry = entries.find((e) => e.id === id);
      if (!entry) return new Response("not found", { status: 404 });

      let next = entries;
      if (act === "archive") {
        entry.disposition = "archived";
      } else if (act === "delete") {
        await unlink(join(LINKS, `${id}.html`)).catch(() => {}); // unlink only
        next = entries.filter((e) => e.id !== id);
      } else {
        return new Response("unknown action", { status: 400 });
      }
      await saveManifest(next);
      await regenIndex(next); // keep index.html in lockstep with the manifest
      return new Response("ok");
    }

    // --- static files (Bun.file follows symlinks under LINKS) ---
    const path = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    if (path.includes("..")) return new Response("bad path", { status: 400 }); // no traversal
    const file = Bun.file(join(ROOT, path));
    if (await file.exists()) return new Response(file);
    return new Response("not found", { status: 404 });
  },
});

console.log(`collect-html panel → http://localhost:${PORT}  (root: ${ROOT})`);
