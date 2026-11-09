# Maintenance state — 2026-11-10

Production Worker socialventure-magazine serves socialventure.kr/* and www.socialventure.kr/*.
The owner explicitly requested removing HANAM business-number login and authorized deployment.
Current design deployment: e3b2d37a-4e0f-425a-affc-316d7fd9849a.
Previous direct-access deployment: 7caac0ef-1a63-44ca-b38c-5708563ffece, superseding the login-gated 7b55f526-5efc-4ed7-b3fc-fab46bc8ad99.

- src/hanam-gate.mjs now serves the board directly; do not restore authentication unless requested.
- public/hanam/index.html and public/_astro/hanam* were recovered from the latest deployed files, not original Astro source. Preserve browser storage keys, meeting IDs and existing seed/migration behavior.
- Browser-specific records belong to localStorage and must not be committed or embedded in public HTML.
- Public board has six companies and seven default meetings. External reference links remain external; no locally linked PDF/ZIP attachments were found in the page or its scripts.
- 2026-11-10 release reused the complete Cloudflare asset collection with keep_assets:true, so undiscovered/unlinked files were also preserved. This checkout covers all discovered linked assets, not a proven inventory of every remote file.
- Root Wrangler config now includes the Worker and ASSETS/run_worker_first settings. A full assets upload replaces the remote inventory; verify that inventory before a full replacement. Prefer preserve-assets releases for Worker-only changes.
- Existing secret bindings/rate limiter remain in Cloudflare but are unused by the direct-access Worker. Never publish secret values.
- main was stale (838586c) during recovery. Cloudflare automatic Builds were disabled on 2026-11-10 to prevent old main/CMS commits overwriting the restored deployment. Re-enable only after main has been reconciled and the full deployment asset inventory verified.
- Run sh scripts/local-maintenance.sh check and build. Preview is static only. Worker behavior tests use local fixtures.
- Rollback version 7b55f526-5efc-4ed7-b3fc-fab46bc8ad99 restores login as well as the old Worker; use only if rollback is required.

## Design release — 2026-11-10

- Shared theme sources: public/design/site-20261110.css and .js; regenerate src/generated/site-design.mjs with scripts/build-design-module.mjs. Read DESIGN.md before changing the theme.
- keep_assets inherits the latest uploaded assets, which may differ from the active deployment. Check content, not only settings.
- Worker fallback retains access to files found only in immutable version 7caac0ef. Never delete or disable that version URL until the complete original inventory has been migrated.
- Design checks preserve this editorial/work-tool layout rather than impose full-screen marketing sections.
