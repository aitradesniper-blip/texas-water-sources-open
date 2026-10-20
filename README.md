# Texas Water Sources — open frontend

Reusable original frontend code from [TexasWaterSources.com](https://texaswatersources.com), released under the [MIT license](LICENSE). Start with the well-record research router, then inspect the full frontend implementation in `source/`.

**Public repository:** https://github.com/aitradesniper-blip/texas-water-sources-open

## Run the starter

Requirements: Node.js 22.13+ and npm 10+.

```sh
git clone https://github.com/aitradesniper-blip/texas-water-sources-open.git
cd texas-water-sources-open
npm ci
npm test
npm run dev
```

Open http://localhost:3000. For a static build:

```sh
npm run build
```

Output is in `demo/out`. No API key, account, database, paid service or environment variable is needed. The starter loads no analytics service and submits no forms. Address-search and full-guide links open the live website. The official-system comparison works locally.

## What is included

- The live frontend's original Next.js/React components, styles, source-navigation logic, configuration validators and build/import utilities, under `source/`.
- A runnable, data-independent example that imports the same well-record router used by the live site.
- The original repair-assistance article, with links to official program documents and an explicit dated source check.
- A locked dependency tree, example configuration, contribution guide and data-rights boundary.

This is a clean code snapshot. `source/` is a reference checkout, not a turnkey mirror of the production data service. The full production build requires separately governed data packages, contract fixtures, brand assets and reviewed runtime integrations; those are deliberately absent. The default commands run the self-contained starter instead. No complete statewide live feed is provided. No private repository history or operational account configuration is published.

## District briefings and RSS

The source now includes a small updates section, a verified four-story October 20 briefing, a place filter, canonical sharing links and a static RSS generator. See [UPDATES.md](UPDATES.md) for its data contract and publication checks. Complete source PDFs/video remain on official sites; they are linked, not copied.

- [Read selected district updates](https://texaswatersources.com/updates)
- [Follow via RSS](https://texaswatersources.com/updates/feed.xml)

No fixed publication schedule is promised. Status and deadlines are date-bounded; proposals, decisions and pumping remain separate. The default local starter is still the independent well-record example; the updates implementation is in `source/app/updates` and `source/lib/updates*`.

## Useful entry points

- [Find and compare well records](https://texaswatersources.com/well-records)
- [Repair assistance: check before work](https://texaswatersources.com/well-records/repair-assistance-before-work)
- [Find a groundwater district](https://texaswatersources.com/groundwater-districts)
- [Coverage and source dates](https://texaswatersources.com/groundwater-districts/intelligence/coverage)
- [Official-source directory](https://texaswatersources.com/sources)

Nearby records are leads. Requests, approvals and actual pumping are different evidence. Neither a nearby permit nor a map point establishes failure risk, property association, legal rights, yield or water quality. Missing results do not prove that no record or well exists.

## License and data

See [DATA_RIGHTS.md](DATA_RIGHTS.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [RELEASE_REVIEW.md](RELEASE_REVIEW.md). The code license does not grant rights in linked district documents, datasets, trademarks or dependency code. Complete PDFs, scraped HTML/OCR and the meeting corpus are excluded.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md). Small accessibility fixes, clearer research paths and corrections backed by official sources are welcome. Keep uncertainty visible and never contribute secrets, private addresses, customer records or unsupported outcome claims.
