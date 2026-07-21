# Lucky Interiors Project Instructions

Read `PROJECT_CONTEXT.md` before making changes. It contains the current architecture, commands, SEO/product policies, external data dependencies, deployment workflow, completed work, and next actions.

Important safeguards:

- Do not mass-approve products for SEO.
- Do not mark legacy product images as rights-confirmed without evidence.
- Do not publish guessed dimensions, materials, prices, availability, address, hours, delivery, warranty, origin, or customization claims.
- Preserve local review decisions. The tracked seed is `import-review/review-state.seed.json`; runtime edits are written to the ignored `import-review/review-state.json`.
- Run `npm run build` before any deployment-oriented commit.
- Do not commit generated `tmp/` files, local logs, `.env` files, `dist/`, or `dist-server/`.
