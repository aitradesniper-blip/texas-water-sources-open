import { briefings } from "@/lib/updates-content";
import { buildUpdatesFeed } from "@/lib/updates";
export const dynamic = "force-static";
export function GET() {
  return new Response(buildUpdatesFeed(briefings), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
