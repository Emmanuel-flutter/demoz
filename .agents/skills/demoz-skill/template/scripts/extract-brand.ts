// Brand extraction — the DETERMINISTIC half of a propose-then-confirm flow.
//
// v1 has NO paid API and NO model call. The Claude Code AGENT running the skill
// reads the user's logo/brand media directly and PRODUCES a proposed brand
// profile as JSON. This script then, deterministically:
//   1. Validates that JSON against a Zod schema.
//   2. Runs a WCAG contrast gate (see scripts/wcag.ts) — annotating pass/fail
//      and a suggested repair per colour, never silently overwriting.
//   3. Writes a CANDIDATE (brand.candidate.json) + a human-readable report
//      (brand.candidate.report.md) at the repo root. It does NOT touch the live
//      theme.
//   4. Only with --promote does it write the approved values into src/theme.ts +
//      src/fonts.ts and copy the chosen logo into public/brand/logo-mark.png.
//
// Usage:
//   npm run brand:extract -- --profile brand.candidate-input.json
//   cat profile.json | npm run brand:extract
//   npm run brand:extract -- --promote --profile brand.candidate.json --logo brand-input/logo.png
//
// Headless/CI fallback (future): this is where a headless run could call a
// vision model to PRODUCE the profile JSON instead of the in-session agent.
// Not implemented in v1 — do not add an API key or a model id here.

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { parseFlags, runCli } from "./cli-utils";
import { repairForContrast, type RepairResult } from "./wcag";

const REPO_ROOT = path.resolve(__dirname, "..");
const CANDIDATE_JSON = path.join(REPO_ROOT, "brand.candidate.json");
const CANDIDATE_REPORT = path.join(REPO_ROOT, "brand.candidate.report.md");
const THEME_PATH = path.join(REPO_ROOT, "src", "theme.ts");
const FONTS_PATH = path.join(REPO_ROOT, "src", "fonts.ts");
const LOGO_PATH = path.join(REPO_ROOT, "public", "brand", "logo-mark.png");

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

// 6-digit hex only. The generated theme derives backgroundElevated and builds
// alpha stops (e.g. `${background}00`) by string concatenation that assumes
// #RRGGBB; a 3-digit value would produce NaN channels and non-transparent stops.
const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "must be a 6-digit hex colour like #1A2B3C");
const confidence = z.number().min(0).max(1);

const BrandProfileSchema = z.object({
  // Colour contract — the six tokens the theme uses.
  background: hex,
  accent: hex,
  accentCyan: hex,
  foreground: hex,
  muted: hex,
  backgroundElevated: hex.optional(), // derived from `background` if absent
  // A best-guess font family name (e.g. "Poppins"). Nullable.
  fontGuess: z.string().nullable().optional(),
  // A tagline as a single string or an array of words. Nullable.
  tagline: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  // Optional per-field confidence in [0,1] (e.g. { "accent": 0.8 }).
  confidence: z.record(z.string(), confidence).optional(),
  // Identity fields used by --promote to set the wordmark. `name` is REQUIRED —
  // a confirmed brand must have a name. shortName is derived from name if absent.
  name: z.string().min(1, "a brand name is required"),
  shortName: z.string().optional(),
  parentBrand: z.string().optional(),
  // Optional path to the logo to promote. --logo overrides this.
  logo: z.string().optional(),
});

type BrandProfile = z.infer<typeof BrandProfileSchema>;

// ---------------------------------------------------------------------------
// WCAG gate config
// ---------------------------------------------------------------------------

const GATE: {
  field: keyof BrandProfile;
  against: keyof BrandProfile;
  min: number;
}[] = [
  { field: "foreground", against: "background", min: 4.5 },
  { field: "accent", against: "background", min: 3 },
  { field: "accentCyan", against: "background", min: 3 },
  { field: "muted", against: "background", min: 3 },
];

type GateRow = {
  field: string;
  against: string;
  value: string;
  min: number;
} & RepairResult;

// Same "slight lighten toward white" the theme uses, so a derived
// backgroundElevated matches what src/theme.ts would compute.
const deriveElevated = (background: string): string => {
  const channel = (h: string, i: number) =>
    parseInt(h.replace("#", "").slice(i * 2, i * 2 + 2), 16);
  const expand = (h: string) => {
    const c = h.replace("#", "");
    return c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c;
  };
  const bg = "#" + expand(background);
  const to2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return (
    "#" +
    [0, 1, 2]
      .map((i) => to2(channel(bg, i) + (255 - channel(bg, i)) * 0.08))
      .join("")
  ).toUpperCase();
};

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const readProfileInput = (
  profilePath?: string,
): { raw: string; source: string } => {
  if (profilePath) {
    const resolved = path.resolve(profilePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Profile file not found: ${resolved}`);
    }
    return { raw: fs.readFileSync(resolved, "utf8"), source: resolved };
  }
  if (process.stdin.isTTY) {
    throw new Error(
      "No profile provided. Pass --profile <path.json>, or pipe the profile JSON via stdin.",
    );
  }
  return { raw: fs.readFileSync(0, "utf8"), source: "stdin" };
};

const parseProfile = (
  profilePath?: string,
): { profile: BrandProfile; source: string } => {
  const { raw, source } = readProfileInput(profilePath);
  if (!raw.trim()) {
    throw new Error("Profile is empty.");
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Profile is not valid JSON: ${(err as Error).message}`);
  }
  const parsed = BrandProfileSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Profile failed validation:\n${issues}`);
  }
  return { profile: parsed.data, source };
};

// ---------------------------------------------------------------------------
// Gate + candidate
// ---------------------------------------------------------------------------

const evaluateGate = (profile: BrandProfile): GateRow[] =>
  GATE.map((g) => {
    const value = profile[g.field] as string;
    const background = profile[g.against] as string;
    const repair = repairForContrast(value, background, g.min);
    return { field: g.field, against: g.against, value, min: g.min, ...repair };
  });

const buildCandidate = (profile: BrandProfile) => ({
  ...profile,
  backgroundElevated:
    profile.backgroundElevated ?? deriveElevated(profile.background),
});

const formatTagline = (tagline: BrandProfile["tagline"]): string => {
  if (!tagline) return "(none)";
  return Array.isArray(tagline) ? tagline.join(" | ") : tagline;
};

const buildReport = (
  profile: BrandProfile,
  candidate: ReturnType<typeof buildCandidate>,
  rows: GateRow[],
  source: string,
): string => {
  const conf = (field: string) =>
    profile.confidence && profile.confidence[field] !== undefined
      ? profile.confidence[field].toFixed(2)
      : "—";

  const paletteRows = (
    [
      "background",
      "backgroundElevated",
      "accent",
      "accentCyan",
      "foreground",
      "muted",
    ] as const
  )
    .map(
      (k) =>
        `| ${k} | \`${(candidate as unknown as Record<string, string>)[k]}\` | ${conf(k)} |`,
    )
    .join("\n");

  const gateRows = rows
    .map((r) => {
      const result = r.meets ? "PASS" : "FAIL";
      const repair = r.meets
        ? "—"
        : `\`${r.suggested}\` (${r.suggestedRatio.toFixed(2)}:1)${r.changed ? "" : " [no better value found]"}`;
      return `| ${r.field} | ${r.against} | ${r.ratio.toFixed(2)}:1 | ${r.min.toFixed(1)}:1 | ${result} | ${repair} |`;
    })
    .join("\n");

  const failures = rows.filter((r) => !r.meets).length;

  return `# Brand candidate report

- Generated: ${new Date().toISOString()}
- Source: ${source}
- Font guess: ${profile.fontGuess ?? "(none)"}
- Tagline: ${formatTagline(profile.tagline)}

## Palette

| Token | Hex | Confidence |
|---|---|---|
${paletteRows}

## Contrast gate (WCAG 2.x, colour vs background)

Body text needs >= 4.5:1. Accents and muted text need >= 3:1.

| Element | vs | Ratio | Required | Result | Suggested repair |
|---|---|---|---|---|---|
${gateRows}

## Result

${
  failures === 0
    ? "All colours pass the contrast gate. Nothing was changed."
    : `${failures} colour(s) FAIL the contrast gate. The suggested repairs above are proposals only — nothing is applied automatically. Adjust the profile (or accept the repairs) and re-run.`
}

## Save this profile for future renders

This wrote a CANDIDATE only. To write the approved values into the live theme
(src/theme.ts + src/fonts.ts) and set the logo, run:

\`\`\`
npm run brand:extract -- --promote --profile brand.candidate.json --logo <path/to/logo.png>
\`\`\`
`;
};

// ---------------------------------------------------------------------------
// Promote (writes the live theme — explicit, never automatic)
// ---------------------------------------------------------------------------

// Escape a value for embedding inside a double-quoted TS string literal.
// Handles backslash, quote AND line terminators / control chars — a raw newline
// in a brand field would otherwise split the literal and make theme.ts unparseable.
const escapeString = (s: string): string =>
  Array.from(s)
    .map((c) => {
      const code = c.charCodeAt(0);
      if (c === "\\") return "\\\\";
      if (c === '"') return '\\"';
      if (code < 0x20 || code === 0x2028 || code === 0x2029) {
        return "\\u" + code.toString(16).padStart(4, "0");
      }
      return c;
    })
    .join("");

const renderTaglineLiteral = (tagline: BrandProfile["tagline"]): string => {
  if (!tagline) return '["TAGLINE", "GOES", "HERE"]';
  if (Array.isArray(tagline)) {
    return `[${tagline.map((t) => `"${escapeString(t)}"`).join(", ")}]`;
  }
  return `"${escapeString(tagline)}"`;
};

// Derive a short wordmark (up to 3 chars) from the brand name when none is given:
// initials for a multi-word name, otherwise the first 3 letters of the one word.
const deriveShortName = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const abbrev =
    words.length >= 2 ? words.map((w) => w[0]).join("") : (words[0] ?? "");
  return abbrev.slice(0, 3).toUpperCase() || "BR";
};

// Regenerates src/theme.ts from an approved profile. If the profile gives an
// explicit backgroundElevated we write it as a literal; otherwise we DERIVE it
// from `background` (matching the shipped neutral theme) and emit the helper.
// The helper is only included when it is actually used, so the output stays
// lint-clean (no unused local).
const renderThemeFile = (profile: BrandProfile): string => {
  const deriveElevatedInline = profile.backgroundElevated === undefined;
  const helper = deriveElevatedInline
    ? `// Slight lighten of \`background\` toward white, for elevated surfaces.
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

`
    : "";
  const elevatedValue = deriveElevatedInline
    ? `mixToward(background, "#FFFFFF", 0.08)`
    : `"${profile.backgroundElevated}"`;

  return `// Brand tokens for THIS project's videos.
//
// Written by \`npm run brand:extract -- --promote\`. Edit by hand any time — keep
// the token NAMES stable (components import them); change only the values.

// Confirmed by a human (--promote) and passed the WCAG contrast gate, so the
// demo compositions render this brand instead of the setup screen.
export const brandReady = true;

${helper}const background = "${profile.background}";

export const brand = {
  name: "${escapeString(profile.name)}",
  shortName: "${escapeString(profile.shortName ?? deriveShortName(profile.name))}",
  tagline: ${renderTaglineLiteral(profile.tagline)},
  parentBrand: "${escapeString(profile.parentBrand ?? "")}",
  logoMark: "brand/logo-mark.png",
} as const;

export const colors = {
  background,
  backgroundElevated: ${elevatedValue},
  accent: "${profile.accent}",
  accentCyan: "${profile.accentCyan}",
  foreground: "${profile.foreground}",
  muted: "${profile.muted}",
} as const;

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
`;
};

const toGoogleFontPath = (name: string): string =>
  name
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ""))
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join("");

const renderFontsFile = (fontGuess?: string | null): string => {
  // A fontGuess can sanitise to an empty path (e.g. "!!!"), which would emit an
  // invalid `@remotion/google-fonts/` import. Fall back to the default face then.
  const guessPath = fontGuess ? toGoogleFontPath(fontGuess) : "";
  const heading = guessPath || "Aldrich";
  const warn = guessPath
    ? `// NOTE: heading font was set from the extraction fontGuess ("${escapeString(
        fontGuess ?? "",
      )}").
// Confirm "${heading}" exists in @remotion/google-fonts; if the build fails,
// revert to a known face such as Aldrich.\n`
    : "";
  return `// Font FACES for this project. Edit this one file to swap fonts.
// Body: Inter. Heading: ${heading}.
${warn}import { loadFont as loadHeadingFont } from "@remotion/google-fonts/${heading}";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Inter";

export const { fontFamily: headingFontFamily } = loadHeadingFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const { fontFamily: bodyFontFamily } = loadBodyFont("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

// System monospace stack for terminal/code-styled scenes — no webfont to load.
export const monoFontFamily = "Menlo, Consolas, monospace";
`;
};

const promote = (profile: BrandProfile, logoFlag: string | undefined) => {
  // Re-run the gate and refuse to promote a failing palette silently.
  const rows = evaluateGate(profile);
  const failures = rows.filter((r) => !r.meets);
  if (failures.length > 0) {
    const list = failures
      .map(
        (r) =>
          `  - ${r.field}: ${r.ratio.toFixed(2)}:1 (needs ${r.min}:1) → try ${r.suggested}`,
      )
      .join("\n");
    throw new Error(
      `Refusing to promote: ${failures.length} colour(s) fail the contrast gate:\n${list}\n` +
        `Fix the profile (or accept the suggested repairs) and re-run.`,
    );
  }

  fs.writeFileSync(THEME_PATH, renderThemeFile(profile));
  fs.writeFileSync(FONTS_PATH, renderFontsFile(profile.fontGuess ?? undefined));
  console.log(`Wrote ${THEME_PATH}`);
  console.log(`Wrote ${FONTS_PATH}`);

  const logoSource = logoFlag ?? profile.logo;
  if (logoSource) {
    const resolved = path.resolve(logoSource);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Logo file not found: ${resolved}`);
    }
    fs.mkdirSync(path.dirname(LOGO_PATH), { recursive: true });
    fs.copyFileSync(resolved, LOGO_PATH);
    console.log(`Copied logo ${resolved} -> ${LOGO_PATH}`);
  } else {
    console.log(
      "No --logo provided; kept the existing public/brand/logo-mark.png.",
    );
  }

  console.log("\nBrand promoted. Render a still to confirm:");
  console.log("  npx remotion still Swatch /tmp/swatch.png");
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const { flags, bools } = parseFlags(process.argv.slice(2));

  if (bools.has("promote")) {
    // Promote reads the approved candidate (default: brand.candidate.json).
    const source = flags.profile ?? CANDIDATE_JSON;
    const { profile } = parseProfile(source);
    promote(profile, flags.logo);
    return;
  }

  const { profile, source } = parseProfile(flags.profile);
  const candidate = buildCandidate(profile);
  const rows = evaluateGate(profile);

  fs.writeFileSync(CANDIDATE_JSON, JSON.stringify(candidate, null, 2) + "\n");
  const report = buildReport(profile, candidate, rows, source);
  fs.writeFileSync(CANDIDATE_REPORT, report);

  // Concise console summary.
  console.log(`Read profile from: ${source}`);
  console.log("Contrast gate:");
  for (const r of rows) {
    const status = r.meets ? "PASS" : "FAIL";
    const extra = r.meets
      ? ""
      : `  -> try ${r.suggested} (${r.suggestedRatio.toFixed(2)}:1)`;
    console.log(
      `  ${status}  ${r.field} vs ${r.against}: ${r.ratio.toFixed(2)}:1 (needs ${r.min}:1)${extra}`,
    );
  }
  const failures = rows.filter((r) => !r.meets).length;
  console.log("");
  console.log(`Wrote candidate: ${CANDIDATE_JSON}`);
  console.log(`Wrote report:    ${CANDIDATE_REPORT}`);
  if (failures > 0) {
    console.log(
      `\n${failures} colour(s) fail the gate. Review the report; nothing was applied. ` +
        `Re-run with --promote once approved.`,
    );
  } else {
    console.log(
      "\nAll colours pass. Re-run with --promote to write the live theme + fonts + logo.",
    );
  }
};

runCli(main);
