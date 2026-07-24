---
name: demoz-skill
description: Set up and extend brand-agnostic demo videos with Remotion in whatever project this skill is installed into. Drop in your logo and brand media, extract a contrast-checked palette, save it to the theme, then render on-brand intros, screen-recording frames, lower-thirds, and outros. Bundles reusable scene components, a WCAG brand-extraction flow, Playwright screenshot capture, and fal.ai AI video/audio generation as a self-contained payload.
metadata:
  tags: remotion, brand, video, playwright, fal, wcag, theming
---

## When to use

Use this skill to create, extend, or set up a branded product-demo video with Remotion. It
works in any project, not only a project that already uses Remotion. This skill is
self-contained. It bundles everything it scaffolds under `template/` next to this file. So
`npx skills add <this-repo>` installs it into any project or empty folder and it still works.

The kit ships with NO default look. Until you set your brand, every composition renders a
"Brand not set" screen. You make the kit yours with the 3-step onboarding below. The brand
renders only after you confirm and verify it (the `--promote` step).

For general Remotion technique (animation timing, layout, sequencing, transitions, fonts), also
load the companion skill `remotion-best-practices`. This skill covers the brand kit and its
bundled tooling only.

## 3-step onboarding — make the videos your brand

Follow these three steps to replace the placeholder brand with your own. The extraction is done
by the agent in this session. It reads your media directly. It does NOT call a paid API.

### Step 1 — Prep

Put your logo in the `brand-input/` folder. Put your brand media there too.

- A brand-guidelines page gives the best colours.
- A marketing screenshot or a product screenshot also works well.
- A bare logo often has no usable palette. Do not rely on a bare logo alone.

### Step 2 — Point

Tell the agent where your brand kit is. Name the folder that holds your media. The default
folder is `brand-input/`.

### Step 3 — Extract and save

The agent reads the media. The agent proposes a palette. Then you review and approve it.

Until you approve, the kit has NO default look. Every composition renders the "Brand not set"
screen. The `--promote` step marks the brand confirmed and verified — it flips `brandReady` to
true — and only then do the compositions render your brand.

1. The agent reads your logo and brand media in `brand-input/`.
2. The agent writes a proposed profile as JSON (the colour tokens, a font guess, a tagline). The
   profile MUST include a `name`. `shortName` is derived from the name when it is absent.
3. The agent runs the deterministic gate:
   ```
   npm run brand:extract -- --profile <proposed-profile>.json
   ```
   This validates the JSON. This runs the WCAG contrast gate. This writes a CANDIDATE
   (`brand.candidate.json`) and a report (`brand.candidate.report.md`). It does NOT change the
   live theme.
4. You review the report. Check the hex values and the pass/fail contrast table. This is the
   review-before-write step.
5. Approve the profile. Then the agent saves it and marks the brand confirmed:
   ```
   npm run brand:extract -- --promote --profile brand.candidate.json --logo brand-input/<your-logo>.png
   ```
   This writes `src/theme.ts` and `src/fonts.ts`. This copies your logo to
   `public/brand/logo-mark.png`. This sets `brandReady = true`. This is the "save for future
   use" step.
6. Verify the result on screen. The brand renders now, so check it:
   ```
   npx remotion still Swatch /tmp/swatch.png
   ```
   Read the image. Confirm the colours, logo, and text read well. If not, adjust the profile and
   run `--promote` again.

Writing the live theme is always its own explicit action. The gate never overwrites the theme
on its own. `--promote` refuses to run when a colour fails the contrast gate. Fix the colour, or
accept the suggested repair, then run again.

Headless/CI fallback (future): a headless run could later call a vision model to produce the
profile JSON instead of the in-session agent. This is not built in v1. Do not add an API key or
a model id for it.

## Fill in your brand profile — the token contract

The brand lives in two files. Change these files to change the brand. Do not hardcode colours or
font names in a scene.

`src/theme.ts` exports:

- `brand.name` — the wordmark. The `Logo` splits it on spaces into stacked lines.
- `brand.shortName`, `brand.tagline` (string or string[]), `brand.parentBrand`, `brand.logoMark`.
- `colors` — `background`, `backgroundElevated` (a derived slight lighten of `background`),
  `accent`, `accentCyan`, `foreground`, `muted`. Keep these names stable.
- `fonts` — heading/body/caption weights and heading letter-spacing.
- `motion` — scene durations and `fps`.

`src/fonts.ts` loads the actual font faces. It ships with Inter for body and Aldrich for
headings. Swap this one file to change fonts. Use any font in `@remotion/google-fonts`. The
import path is the font name in PascalCase, e.g. `@remotion/google-fonts/Poppins`.

The contrast gate (`scripts/wcag.ts`) enforces: `foreground` vs `background` >= 4.5:1, and
`accent`, `accentCyan`, `muted` vs `background` >= 3:1. Preview any brand with the `Swatch`
composition.

## Setting up branded video generation in a project

Check whether the project already has the kit. Does `src/theme.ts` exist and export a `brand`
object and `colors`? If yes, skip to "Adding a new branded scene". Otherwise:

1. **Ensure this is a Remotion project.** If there is no `remotion.config.ts` or `src/Root.tsx`,
   scaffold one first: `npx create-video@latest --yes --blank --no-tailwind .` Run it in the
   current directory. Do not create a nested folder unless the user asked for a sub-project name.

   Two gotchas confirmed by testing this flow:
   - If this skill was installed via `npx skills add` first, the directory already contains
     `.agents/`, `.claude/`, `.github/`. `create-video` refuses to scaffold into a "non-empty"
     directory even though those are just the skill's own files. Move them aside first
     (`mv .agents .claude .github /tmp/skill-stash/`), run the scaffold command, then move them
     back.
   - `--no-tailwind` does not reliably skip Tailwind. Check `remotion.config.ts` and
     `src/index.css` afterwards. If Tailwind got wired in anyway, remove the `enableTailwind`
     import and the `overrideWebpackConfig` call from `remotion.config.ts`, replace
     `src/index.css`'s `@import "tailwindcss";` with a plain reset (e.g. `* { box-sizing:
     border-box; }`), and run `npm uninstall @remotion/tailwind-v4 tailwindcss`.

2. **Copy the bundled template.** This skill's own directory (typically
   `.agents/skills/demoz-skill/`) has a `template/` folder with everything needed:
   - `template/src/theme.ts`, `fonts.ts`, `animation.ts` → copy to `src/`
   - `template/src/components/` → copy to `src/components/`
   - `template/src/compositions/` → copy to `src/compositions/`
   - `template/public/brand/`, `template/public/screenshots/placeholder-product-ui.png` → copy to `public/`
   - `template/scripts/*.ts` → copy to `scripts/`
   - `template/brand-input/README.md` → copy to `brand-input/`
   - `template/.env.example` → copy to the project root
   - `template/src/Root.tsx` → if the project's `src/Root.tsx` is still the untouched scaffold
     default, replace it wholesale. If it already has unrelated compositions registered, merge in
     the `<Composition>` entries and imports by hand instead. Do not overwrite the existing ones.

3. **Install dependencies.** Add these to the project and install:
   ```
   @fal-ai/client, @remotion/google-fonts, @remotion/media, @remotion/transitions,
   @remotion/zod-types, dotenv, playwright, zod  (dependencies)
   tsx  (devDependency)
   ```
   Prefer `npx remotion add @remotion/google-fonts` / `@remotion/media` / `@remotion/transitions`
   / `@remotion/zod-types` so their versions stay pinned to the project's installed `remotion`
   version. Then run `npm install @fal-ai/client playwright dotenv zod` and `npm install -D tsx`.

4. **Add npm scripts** to `package.json`:
   ```json
   "capture": "tsx scripts/capture-screenshots.ts",
   "playwright:install": "playwright install chromium",
   "brand:extract": "tsx scripts/extract-brand.ts",
   "gen:video": "tsx scripts/generate-video.ts",
   "gen:audio": "tsx scripts/generate-audio.ts"
   ```

5. **Verify it renders** before considering setup done:
   ```bash
   npm install
   npx remotion still FullWalkthrough /tmp/check.png --frame=45
   ```
   Read the output image back. Because the brand is not set yet, it renders the neutral "Brand not
   set" screen (there is no default look). That is the correct initial state. Then run the 3-step
   onboarding above to make it your brand; after `--promote`, re-render to see your brand.

## Adding a new branded scene

1. Create `src/compositions/<Name>.tsx`. Define a Zod `z.object({...})` schema for its props (see
   `parameters.md` in `remotion-best-practices`). Use `zColor()` from `@remotion/zod-types` for
   any colour prop.
2. Import `colors`/`fonts` from `../theme`, font families from `../fonts`, and
   `enterProgress`/`exitProgress` from `../animation`. Do not hand-roll a new `interpolate()`
   easing/clamp block. Do not introduce new colours or fonts.
3. Reuse `Backdrop` for the brand backdrop and `Logo` for the mark, rather than rebuilding them.
4. If a scene enters/exits via a `@remotion/transitions` `TransitionSeries` `fade()`, do NOT also
   give the scene its own internal opacity fade on the same edge. The two compound
   multiplicatively (CSS opacity is multiplicative through nested elements). The entrance/exit
   then reads dimmer and slower than either animation alone intends. Motion (scale/translate) is
   fine to keep. Only opacity compounds this way.
5. Prefer `slide()` over `fade()` between any two scenes that both centre their content (title
   cards, window-chrome cards like `TerminalCard`/`ChatCard`/`ScreenRecordingFrame` — most brand
   scenes do this). A `fade()` crossfade renders both scenes at full layout at the same time, so
   their centred content double-exposes into a garbled overlap during the transition — confirmed
   by rendering a mid-transition still frame, not just by reading the code. `slide()` moves
   content across the frame instead of blending it, so outgoing and incoming content never share
   the same pixels for long. It stays clean at any transition duration. Alternate `direction`
   (`from-left`/`from-right`/`from-bottom`/`from-top`) scene to scene for rhythm. Reserve
   `fade()` for cuts where the two scenes clearly do not share screen position (e.g. a full-bleed
   background scene into another full-bleed background scene with no competing centred text).
6. Register the new composition in `src/Root.tsx` inside a folder, with sensible `defaultProps`.
   Pull frame counts from `theme.ts`'s `motion` export where they exist. Do not re-type a
   duration as a bare number.
7. Follow `remotion-best-practices` for timing/layout/sequencing — in particular the
   video-layout rules (one focal point per frame, generous safe margins, no overlapping
   elements). If a scene is placed inside another (e.g. an overlay on `ScreenRecordingFrame`),
   leave room for it via the container's layout (e.g. `paddingBottom` on the wrapping
   `AbsoluteFill`), not by hardcoding an offset into the child component.
8. After writing it, render a still frame to check the layout:
   ```bash
   npx remotion still <CompositionId> /tmp/check.png --frame=<n>
   ```
   Read the output image. Check for overlap, cropped text, or off-brand colours. If the scene is
   part of a `TransitionSeries`, also render a frame from the middle of each transition into and
   out of it. That is the only way the fade-vs-slide double-exposure issue actually shows up.

## Getting real footage: Playwright screenshots

Use `npm run capture` to screenshot software for `ScreenRecordingFrame`:

```bash
npm run playwright:install   # once, downloads the Chromium binary
npm run capture -- --url https://internal.company.com/product --out public/screenshots/product.png --full-page
```

For tools behind SSO/login, sign in once and save the session, then reuse it:

```bash
npx playwright open <url> --save-storage=auth.json
npm run capture -- --url <url> --out public/screenshots/product.png --storage-state auth.json
```

Point a `ScreenRecordingFrame`'s `mediaSrc` at the captured file, **without** the `public/`
prefix (e.g. `screenshots/product.png` for a file at `public/screenshots/product.png`). Remotion's
`staticFile()` throws if you include the `public/` prefix.

## Generating AI video/audio: fal.ai

`FAL_KEY` must be set in `.env` (get one at https://fal.ai/dashboard/keys — never commit this
file; `.gitignore` already excludes it). Use these only for supplementary B-roll/narration/SFX
around real product screenshots. They are not a substitute for the actual screen captures.

```bash
# Cinematic B-roll with native audio (ByteDance Seedance 2.0)
npm run gen:video -- --prompt "..." --out public/generated/video/clip.mp4 --resolution 1080p

# Narration voiceover (ElevenLabs Eleven v3 — supports inline emotion tags like [excited])
npm run gen:audio -- voiceover --text "..." --out public/generated/audio/narration.mp3 --voice Aria

# Sound effects (ElevenLabs Sound Effects v2)
npm run gen:audio -- sfx --text "a soft UI click" --out public/generated/audio/click.mp3 --duration 1

# Background music (Google Lyria2) — generates ~33s of WAV audio regardless of the --out
# extension; use .wav. For a longer video, loop it with
# <Audio loop loopVolumeCurveBehavior="extend" volume={...}> rather than generating a second clip.
npm run gen:audio -- music --text "..." --out public/generated/audio/theme.wav --negative-prompt "vocals, low quality"
```

These are paid API calls. Check with the team before generating in bulk. If fal.ai's model
catalogue has moved on since this was written, verify the current top-tier model slug before
assuming these are still state of the art (search fal.ai's model explorer rather than guessing).

Reference generated media the same way as any other asset: `staticFile("generated/video/clip.mp4")`
into `ScreenRecordingFrame`'s `mediaSrc` with `mediaType="video"`, or import `<Audio>` from
`@remotion/media` (not `remotion`'s own `Audio`) for music/voiceover/SFX tracks and
`<OffthreadVideo>` for video.

## Companion skill

Load `remotion-best-practices` for general Remotion technique — animation timing, layout,
sequencing, transitions, fonts, captions, and more. This skill covers the brand kit only.
