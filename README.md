# demoz

A brand-agnostic [Remotion](https://remotion.dev) demo-video kit — for producing product/software
demo videos (screen captures plus a branded intro/outro/lower-thirds, and optionally AI-generated
B-roll and voiceover) that look consistent across every team that uses it.

It has **no default look**: until you set your brand, every composition renders a "Brand not set"
screen. You make it your brand with a 3-step onboarding: drop in your logo and brand media, extract
a contrast-checked palette, review it, and save it to the theme — then the compositions render your
brand.

## Quickstart

```bash
npm install
npm run dev          # opens Remotion Studio — preview/edit compositions live
```

This kit has **no default look**. Until you set your brand, every composition renders a
"Brand not set" screen that points you to the 3-step onboarding below. Once your brand is saved,
open `Full-Examples/FullWalkthrough` for the reference example (Intro → branded screen-recording
frame with a lower-third → Outro), swap in a real screenshot (see below), and edit the text props
in the Studio sidebar. Open `Brand/Swatch` to see your palette as colour chips and sample text.

To render an actual video file:

```bash
npm run render -- FullWalkthrough out/walkthrough.mp4
```

## Make it your brand (3-step onboarding)

The brand lives in `src/theme.ts` (colours, tagline, logo path), `src/fonts.ts` (font faces), and
`public/brand/logo-mark.png` (the mark). Change those and the whole kit follows.

**No default look.** The kit ships with the brand _unset_ — every composition shows a "set up your
brand" screen until you finish onboarding. The `--promote` step marks the brand confirmed and
verified (it writes only after the WCAG gate passes and sets `brandReady = true`); from then on the
compositions render your brand.

The easiest path is to let Claude Code do it via the bundled `demoz-skill`:

1. **Prep.** Put your logo and brand media in `brand-input/`. A brand-guidelines page or a
   marketing/product screenshot gives the best colours; a bare logo often has no usable palette.
2. **Point.** Tell the agent where your brand kit is (default: `brand-input/`).
3. **Extract and save.** The agent reads the media, proposes a contrast-checked palette, and you
   review it. On approval, it saves the profile to `src/theme.ts` / `src/fonts.ts` / the logo for
   all future renders.

Under the hood, the deterministic half is `npm run brand:extract`:

```bash
# 1. Validate a proposed profile + run the WCAG contrast gate. Writes a CANDIDATE
#    (brand.candidate.json) and a report (brand.candidate.report.md). Does NOT touch the live theme.
npm run brand:extract -- --profile <proposed-profile>.json

# 2. Review brand.candidate.report.md — the hex values and the pass/fail contrast table.

# 3. Save the approved candidate into the live theme + fonts + logo, and set brandReady=true.
#    This confirmed + verified step refuses to write a failing palette.
npm run brand:extract -- --promote --profile brand.candidate.json --logo brand-input/<your-logo>.png

# 4. Verify on screen — the brand renders now (before this it showed the "Brand not set" screen).
npx remotion still Swatch /tmp/swatch.png
```

The gate enforces WCAG contrast: `foreground` vs `background` >= 4.5:1, and `accent`/`accentCyan`/
`muted` vs `background` >= 3:1. It annotates pass/fail and a suggested repair per colour — it never
silently overwrites, and `--promote` refuses to write a failing palette. The extraction itself is
done by the agent reading your media in-session. There is no paid API and no API key.

## Using this with Claude Code

This repo ships two agent skills under `.claude/skills/` (symlinked from `.agents/skills/`, so they
also work with other skill-compatible agents):

- **`remotion-best-practices`** — the official Remotion skill (animation timing, layout,
  sequencing, transitions, fonts, etc.)
- **`demoz-skill`** — this kit's brand-extraction flow, component inventory, and the Playwright/fal.ai
  workflows. It is **self-contained**: it bundles a full copy of the kit under its own `template/`
  folder, so installing it via `npx skills add` (see below) drops everything needed into whatever
  project you run it in — you do not need this repo itself.

Open this project in Claude Code and ask it to build or extend a video in plain language, e.g.
_"add a new scene showing the reporting dashboard, with a lower third that says 'Live Reporting'"_.
Claude Code reads the skill, reuses the existing brand components, and registers the new composition.

## Getting real footage: Playwright screenshots

```bash
npm run playwright:install                                   # once
npm run capture -- --url https://internal.company.com/product --out public/screenshots/product.png --full-page
```

For tools behind SSO/login, sign in once and reuse the session:

```bash
npx playwright open <url> --save-storage=auth.json
npm run capture -- --url <url> --out public/screenshots/product.png --storage-state auth.json
```

Point `ScreenRecordingFrame`'s `mediaSrc` prop at the saved file — **drop the `public/` prefix**,
e.g. `mediaSrc="screenshots/product.png"` for the file at `public/screenshots/product.png`.
Remotion's `staticFile()` throws if you include the `public/` prefix.

## Bring your own key (BYOK)

You supply your own provider key. Put it in `.env`. Never commit `.env`. `.gitignore` already
excludes it.

Media creation uses that key. Media creation covers video and audio. The brand extraction step
does not need a key. The agent reads your media in-session for extraction.

The default integration uses fal.ai. You may point the key and the model at your own choice. Set
`FAL_KEY` in `.env` to your provider key.

You can bring your own model for each media type. Set the model-override variable in `.env`. Or
pass `--model <slug>` on the command. The `--model` flag wins over the variable. A blank variable
uses the built-in default.

| Media type    | Command               | Env variable        | Default model                          |
| ------------- | --------------------- | ------------------- | -------------------------------------- |
| Video         | `gen:video`           | `VIDEO_MODEL`       | `bytedance/seedance-2.0/text-to-video` |
| Voiceover     | `gen:audio voiceover` | `AUDIO_TTS_MODEL`   | `fal-ai/elevenlabs/tts/eleven-v3`      |
| Music         | `gen:audio music`     | `AUDIO_MUSIC_MODEL` | `fal-ai/lyria2`                        |
| Sound effects | `gen:audio sfx`       | `AUDIO_SFX_MODEL`   | `fal-ai/elevenlabs/sound-effects/v2`   |

Note: image assets come from Playwright screenshots (see above), not a generation model, so there
is no image-model variable.

## AI-generated video & audio (fal.ai)

Copy `.env.example` to `.env` and add your own key from https://fal.ai/dashboard/keys — `.env` is
gitignored, never commit it. See "Bring your own key (BYOK)" above to override the model per media
type.

```bash
npm run gen:video -- --prompt "..." --out public/generated/video/clip.mp4 --resolution 1080p
npm run gen:audio -- voiceover --text "..." --out public/generated/audio/narration.mp3 --voice Aria
npm run gen:audio -- sfx --text "a soft UI click" --out public/generated/audio/click.mp3 --duration 1
```

These call paid, state-of-the-art models (verify they are still current before relying on this
blindly — fal's catalogue moves fast). Use them for supplementary B-roll/narration/SFX around real
product screenshots, not as a replacement for them.

## Project structure

```
brand-input/                  step 1: drop your logo + brand media here (git-ignored except README)
src/
  theme.ts, fonts.ts, animation.ts   brand tokens, font loading, shared enter/exit timing helpers
  components/
    Backdrop.tsx              neutral branded backdrop (solid background + subtle accent glow)
    Logo.tsx                  animatable logo mark + wordmark (derived from brand.name) + tagline
    Typewriter.tsx            string-slicing typewriter effect (with blinking cursor)
    TitleCard.tsx             big-statement scene (title + optional subtitle)
    ProblemReveal.tsx         staggered punch-in reveal for a short list of phrases
    TerminalCard.tsx          terminal-window mockup for a CLI command + output
    ChatCard.tsx              chat-window mockup for a prompt + response
  compositions/
    Intro.tsx, Outro.tsx      bookend scenes
    LowerThird.tsx            caption overlay for feature callouts
    ScreenRecordingFrame.tsx  browser-chrome frame around a screenshot or screen-capture video
    FullWalkthrough.tsx       reference example chaining the above with fade transitions
    Swatch.tsx                brand-profile preview (colour chips + sample text + logo)
public/
  brand/                      logo-mark.png (neutral placeholder, transparent)
  screenshots/                placeholder-product-ui.png; your Playwright captures land here
  generated/video, /audio     fal.ai output lands here
scripts/
  extract-brand.ts            brand extraction gate (validate + WCAG + candidate/report + --promote)
  wcag.ts                     dependency-free contrast helpers (luminance, ratio, repair)
  capture-screenshots.ts      Playwright screenshot CLI
  generate-video.ts, generate-audio.ts, fal-client.ts, cli-utils.ts   fal.ai CLIs + shared arg parsing
  sync-skill-template.sh      copies the kit into the skill's bundled payload (run after editing src/)
```

## Rolling this out to another team

**Recommended: install the skill, don't clone the repo.** Any team can run this in their own
project (existing or empty) and open it in Claude Code:

```bash
npx skills@1.2.0 add Emmanuel-flutter/demoz --yes
```

This installs both
`demoz-skill` and `remotion-best-practices` into `.agents/skills/` (symlinked for Claude Code and
GitHub Copilot). Then in Claude Code, ask it to set up a branded demo video — the `demoz-skill`
detects whether the project already has the kit, scaffolds a Remotion project if needed, copies in
the bundled components/scripts, and runs the 3-step brand onboarding.

If you change the kit (`src/theme.ts`, `src/fonts.ts`, `src/animation.ts`, `src/components/`,
`src/compositions/`, `public/brand/`, `scripts/`, `brand-input/README.md`, `.env.example`), run
`./scripts/sync-skill-template.sh` afterwards to keep the skill's bundled copy in sync.

## License note

Remotion itself is free for companies/teams of up to 3 people; anything larger requires a
[company license](https://www.remotion.pro/license). Rolling this out across multiple internal
teams almost certainly crosses that threshold — confirm licensing before wider distribution.
