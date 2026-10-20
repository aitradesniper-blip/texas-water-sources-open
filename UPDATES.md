# Source-linked updates

`source/lib/updates-content.ts` contains original editorial briefings. The implementation is under `source/app/updates`; `source/lib/updates.ts` validates the publication fields and creates static RSS XML. The public starter remains independent of production datasets. `npm test` also checks the reusable feed/validation helpers.

Each briefing needs a permanent slug, title, summary, actual publication timestamp and source-check calendar date. Reader-facing dates use America/Chicago; meeting times are explicitly Central. Each item requires a place, who it matters to, what changed, status at source check, a next date/action, exact HTTPS primary evidence with page/timestamp locators, and explicit unknowns. Optional source-date labels preserve their roles. The publisher must verify the source content; structural validation cannot verify facts.

An empty edition cannot be built. Do not publish placeholders, a promised schedule, stale dates as future opportunities, predicted well harm or a statewide completeness claim. Use original neutral summaries; link original documents without bundling complete copyrighted PDFs, video, raw HTML/OCR, private research notes or governed data.

The static Next.js RSS route is `/updates/feed.xml`. RSS contains the same scope, status, next actions, unknowns and source URLs as the article. Permanent GUIDs use the canonical briefing URL. Feed generation makes no network request and requires no signup, credential or external service. Existing page analytics remains separate; the interface emits only three bounded action names for opening a briefing, source or feed, without personal data or click text. A feed click does not prove a subscription or usage result.

Before publishing an edition, review all facts/dates against primary evidence, run the helper tests and production build, parse the emitted XML, verify canonical/sitemap/feed links, and check mobile/keyboard/no-JavaScript reading. Confirm real public output after deployment. This release adds no automatic source refresh or publishing cadence.

The place filter remains disabled until its client event handler is ready. With JavaScript disabled, all items remain available for reading and native-link navigation. Hosted acceptance verifies the filtered result after hydration.
