#!/usr/bin/env bash
# The demoz-skill (.agents/skills/demoz-skill/) bundles a copy of this project's
# kit under template/ so `npx skills add` can install it into any project, not
# just this one. `.claude/skills/demoz-skill` and `.github/skills/demoz-skill`
# are symlinks to the same files, so they stay byte-identical automatically.
#
# Run this after changing src/theme.ts, src/fonts.ts, src/animation.ts,
# src/Root.tsx, src/components/, src/compositions/, public/brand/,
# public/screenshots/placeholder-product-ui.png, scripts/, brand-input/README.md,
# or .env.example, to keep the bundled copy in sync.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST=.agents/skills/demoz-skill/template
rm -rf "$DEST"
mkdir -p "$DEST/src" "$DEST/public" "$DEST/scripts" "$DEST/brand-input"

cp -R src/theme.ts src/fonts.ts src/animation.ts src/Root.tsx src/components src/compositions "$DEST/src/"
cp -R public/brand "$DEST/public/"
mkdir -p "$DEST/public/screenshots"
cp public/screenshots/placeholder-product-ui.png "$DEST/public/screenshots/"
cp scripts/fal-client.ts scripts/cli-utils.ts scripts/generate-video.ts scripts/generate-audio.ts \
   scripts/capture-screenshots.ts scripts/extract-brand.ts scripts/wcag.ts "$DEST/scripts/"
cp .env.example "$DEST/"
cp brand-input/README.md "$DEST/brand-input/"

echo "Synced template payload into $DEST"
