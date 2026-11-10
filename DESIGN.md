# Socialventure design maintenance

This is a Korean editorial archive with linked working tools, not a campaign landing page.
Preserve its Pretendard font, blue identity, published text, contact address and all content URLs.

- Read: homepage, collections, insights and articles. Neutral paper, strong navy text, restrained blue links, readable Korean line height, clear heading hierarchy.
- Operate: HANAM and quotation editor. Stable placement, 44px controls, explicit feedback, no decorative task animations. Keep all browser storage keys and document print styles.
- Interaction: one short homepage entrance; hover transforms only on fine pointers; reduced-motion disables movement. Modal focus stays within the dialog and returns to the opener. Clipboard success only after a successful write.

Source of truth: public/design/site-20261110-brand.css and .js (see DESIGN-character.md). `node scripts/build-design-module.mjs` generates src/generated/site-design.mjs for the Worker. The local build includes the same files. Do not edit generated output alone.

The production Worker serves the two design paths and injects them into existing HTML using HTMLRewriter. It preserves all current static assets and excludes the CMS admin page. Source content and HANAM runtime scripts are not replaced. The homepage card heading level changes from h2 to h3. Local Astro and Worker-rendered pages share the same theme.

Release with keep_assets:true and inherited bindings. Do not run a full asset replacement until every remote asset is inventoried. Compare preview against production before deployment, excluding only the declared theme injection, homepage heading levels and Cloudflare analytics. Automatic Cloudflare builds remain disabled.

Taste's full-screen sections, photos in every card, sales CTA and motion showcase requirements do not fit this reading/working scope. Retain a compact archive and report those checker findings without presenting them as passing. No waivers or checker edits.

Cloudflare keep_assets was verified to inherit the most recent upload, not necessarily the active production version. The current known content matches production apart from generated stylesheet names and the declared design changes. For otherwise missing files, the Worker falls back to the immutable original version 7caac0ef (no credentials forwarded). Preserve that version and its version URL until all original files have been inventoried and migrated. This fallback keeps unknown historical attachments reachable; it is not a claim that the local checkout contains them all. Give theme files new versioned names for future releases to avoid stale caches.
