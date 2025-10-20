/** @file Minimal Bun static server with SPA fallback for the playground build. */

import { serve } from "bun";

const port = Number(process.env.PORT ?? 3000);
const dist = new URL("./dist", import.meta.url).pathname;

serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const candidate = Bun.file(`${dist}${path}`);

    if (await candidate.exists()) {
      return new Response(candidate);
    }

    const fallback = Bun.file(`${dist}/index.html`);
    if (await fallback.exists()) {
      return new Response(fallback, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`🚀 Serving dist/ on http://localhost:${port}`);
