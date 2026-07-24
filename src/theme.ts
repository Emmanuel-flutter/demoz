// Brand tokens for THIS project's videos.
//
// This ships with a NEUTRAL placeholder brand so the project renders out of the
// box. To make it yours, run the brand extraction flow (see the `demoz-skill`
// SKILL.md, 3-step onboarding) — the agent reads your logo/brand media, proposes
// a contrast-checked palette, and on approval writes the approved values back
// into THIS file (and src/fonts.ts + public/brand/logo-mark.png). You can also
// edit the values below by hand.
//
// Keep the token NAMES stable — every component imports these names. Only change
// the values.

// Slight lighten of `background` toward white, for elevated surfaces (cards,
// window chrome). Derived so it always tracks the base background.
const mixToward = (hex: string, target: string, amount: number): string => {
  const channel = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const to2 = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return (
    "#" +
    [0, 1, 2].map((i) => to2(channel(hex, i) + (channel(target, i) - channel(hex, i)) * amount)).join("")
  );
};

const background = "#0B0F17";

export const brand = {
  name: "Your Brand",
  shortName: "YB",
  // Rendered by the Logo/Swatch as "TAGLINE | GOES | HERE". Kept as an array to
  // match the token contract; a plain string also works (the Logo normalises it).
  tagline: ["TAGLINE", "GOES", "HERE"],
  parentBrand: "",
  logoMark: "brand/logo-mark.png",
} as const;

export const colors = {
  background,
  backgroundElevated: mixToward(background, "#FFFFFF", 0.08),
  accent: "#5B8DEF",
  accentCyan: "#3FD0C9",
  foreground: "#F4F6FB",
  muted: "#9AA6B8",
} as const;

// Font WEIGHTS + letter-spacing used across scenes. The actual font FACES load
// in src/fonts.ts — swap that one file to change fonts for your brand.
export const fonts = {
  headingWeight: 400,
  bodyWeight: 500,
  captionWeight: 600,
  letterSpacingHeading: "0.08em",
} as const;

export const motion = {
  introDurationInFrames: 90,
  outroDurationInFrames: 75,
  lowerThirdDurationInFrames: 120,
  fps: 30,
} as const;
