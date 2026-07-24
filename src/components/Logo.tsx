import { Img, staticFile } from "remotion";
import { brand, colors, fonts } from "../theme";
import { headingFontFamily, bodyFontFamily } from "../fonts";

// Renders any brand generically: the wordmark is derived from `brand.name`
// (split on spaces into stacked lines) and the tagline accepts a string or a
// string[]. Nothing brand-specific is hardcoded here — change the values in
// src/theme.ts and this component follows.
export const Logo: React.FC<{
  markOpacity: number;
  markTranslateY: number;
  wordmarkOpacity: number;
  taglineOpacity: number;
  scale?: number;
}> = ({ markOpacity, markTranslateY, wordmarkOpacity, taglineOpacity, scale = 1 }) => {
  const wordmarkLines = brand.name.trim().split(/\s+/);
  const taglineText = Array.isArray(brand.tagline)
    ? brand.tagline.join("  |  ")
    : brand.tagline;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 24 * scale,
      }}
    >
      <Img
        src={staticFile(brand.logoMark)}
        style={{
          height: 120 * scale,
          opacity: markOpacity,
          translate: `0px ${markTranslateY}px`,
        }}
      />
      <div
        style={{
          fontFamily: headingFontFamily,
          fontWeight: fonts.headingWeight,
          fontSize: 56 * scale,
          lineHeight: 1.05,
          letterSpacing: fonts.letterSpacingHeading,
          color: colors.foreground,
          opacity: wordmarkOpacity,
          textTransform: "uppercase",
        }}
      >
        {wordmarkLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      {taglineText ? (
        <div
          style={{
            fontFamily: bodyFontFamily,
            fontWeight: fonts.captionWeight,
            fontSize: 22 * scale,
            letterSpacing: "0.15em",
            color: colors.accentCyan,
            opacity: taglineOpacity,
            textTransform: "uppercase",
          }}
        >
          {taglineText}
        </div>
      ) : null}
    </div>
  );
};
