import test from "node:test";
import assert from "node:assert/strict";
import { buildUpdatesFeed, validateBriefings } from "../lib/updates.ts";

const sample = () => ({ slug: "test-briefing", title: "Test & evidence", summary: "Synthetic test fixture only.", publishedAt: "2026-10-20T12:00:00Z", checkedOn: "2026-10-20", items: [{ id: "test-item", place: "Test district", title: "Example notice", mattersTo: "Test readers", changed: "A synthetic notice was added.", status: "Notice, not an approval", nextAction: "Read the original source.", sources: [{ title: "Test source <example>", url: "https://example.org/document?a=1&b=2", locator: "Page 1" }], unknowns: ["No outcome established."] }] });

test("publication rejects empty or incomplete briefings and unsafe source destinations", () => {
  assert.throws(() => validateBriefings([]));
  for (const field of ["mattersTo", "changed", "status", "nextAction"]) {
    const value = sample(); value.items[0][field] = ""; assert.throws(() => validateBriefings([value]));
  }
  const missingEvidence = sample(); missingEvidence.items[0].sources = []; assert.throws(() => validateBriefings([missingEvidence]));
  const unknowns = sample(); unknowns.items[0].unknowns = []; assert.throws(() => validateBriefings([unknowns]));
  for (const url of ["http://example.org/document", "https://user:pass@example.org/document"]) {
    const value = sample(); value.items[0].sources[0].url = url; assert.throws(() => validateBriefings([value]));
  }
});

test("feed includes scope, status, next action, unknowns and exact primary URLs safely escaped", () => {
  const xml = buildUpdatesFeed([sample()]);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(xml, /<title>Test &amp; evidence<\/title>/);
  assert.match(xml, /Test source &lt;example&gt;/);
  assert.match(xml, /https:\/\/example.org\/document\?a=1&amp;b=2/);
  for (const label of ["Who it matters to:", "What changed:", "Status at source check:", "Next date or action to check:", "Unknowns:", "Primary evidence:"]) assert.ok(xml.includes(label));
  assert.match(xml, /<guid isPermaLink="true">https:\/\/texaswatersources.com\/updates\/test-briefing<\/guid>/);
  assert.match(xml, /No fixed publication schedule/);
});

test("feed ordering and build date are deterministic, with unique permanent URLs", () => {
  const first = sample(); const second = sample(); second.slug = "later-test"; second.publishedAt = "2026-10-21T12:00:00Z";
  const xml = buildUpdatesFeed([first, second]);
  assert.ok(xml.indexOf("/updates/later-test</link>") < xml.indexOf("/updates/test-briefing</link>"));
  assert.match(xml, /<lastBuildDate>Wed, 21 Oct 2026 12:00:00 GMT<\/lastBuildDate>/);
  assert.throws(() => validateBriefings([first, first]));
  assert.equal(xml, buildUpdatesFeed([second, first]));
});

test("expanded briefing details remain readable in RSS and reject empty sections", () => {
  const value = sample();
  value.items[0].details = [{ heading: "Selected proposal", paragraphs: ["Conditional requirement, not an adopted rule.", "Read the primary source."] }];
  const xml = buildUpdatesFeed([value]);
  assert.match(xml, /Selected proposal: Conditional requirement, not an adopted rule\.\nRead the primary source\./);
  value.items[0].details[0].paragraphs = [];
  assert.throws(() => validateBriefings([value]));
});
