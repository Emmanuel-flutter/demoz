// Font FACES for this project. This is the ONE file to edit to swap fonts for
// your brand.
//
// Ships with neutral, out-of-the-box defaults:
//   - Heading: Aldrich — a clean geometric display face (a good neutral for
//     uppercase headings/wordmarks).
//   - Body: Inter — a highly readable neutral sans.
//
// To change fonts, replace the two `@remotion/google-fonts/<Name>` imports with
// any font from the @remotion/google-fonts catalogue (the import path is the
// font name in PascalCase, e.g. `@remotion/google-fonts/Poppins`). The brand
// extraction flow's `--promote` step can rewrite this file for you when a font
// guess is supplied; always confirm the chosen font exists in the catalogue.

import { loadFont as loadHeadingFont } from "@remotion/google-fonts/Aldrich";
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
