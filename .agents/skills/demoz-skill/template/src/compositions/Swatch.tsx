import { z } from "zod";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { headingFontFamily, bodyFontFamily } from "../fonts";
import { Logo } from "../components/Logo";

export const SwatchSchema = z.object({});

// A static preview of the current brand profile. Render a still to eyeball a
// proposed palette before promoting it:
//   npx remotion still Swatch /tmp/swatch.png
// Shows every colour token as a chip, sample heading/body/muted text at real
// contrast, and the logo on the brand background.
const CHIPS: { label: string; value: string }[] = [
  { label: "background", value: colors.background },
  { label: "backgroundElevated", value: colors.backgroundElevated },
  { label: "accent", value: colors.accent },
  { label: "accentCyan", value: colors.accentCyan },
  { label: "foreground", value: colors.foreground },
  { label: "muted", value: colors.muted },
];

export const Swatch: React.FC<z.infer<typeof SwatchSchema>> = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, padding: 96 }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 48 }}>
        {/* Logo + wordmark on the brand background */}
        <Logo
          markOpacity={1}
          markTranslateY={0}
          wordmarkOpacity={1}
          taglineOpacity={1}
          scale={0.6}
        />

        {/* Colour chips */}
        <div style={{ display: "flex", gap: 20 }}>
          {CHIPS.map((chip) => (
            <div key={chip.label} style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div
                style={{
                  height: 130,
                  borderRadius: 14,
                  backgroundColor: chip.value,
                  border: `1px solid ${colors.muted}55`,
                }}
              />
              <div
                style={{
                  fontFamily: bodyFontFamily,
                  fontWeight: fonts.bodyWeight,
                  fontSize: 22,
                  color: colors.foreground,
                }}
              >
                {chip.label}
              </div>
              <div
                style={{
                  fontFamily: bodyFontFamily,
                  fontWeight: fonts.bodyWeight,
                  fontSize: 20,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {chip.value}
              </div>
            </div>
          ))}
        </div>

        {/* Sample text at real contrast */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: "auto" }}>
          <div
            style={{
              fontFamily: headingFontFamily,
              fontWeight: fonts.headingWeight,
              fontSize: 68,
              letterSpacing: fonts.letterSpacingHeading,
              color: colors.foreground,
              textTransform: "uppercase",
            }}
          >
            Heading sample on background
          </div>
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontWeight: fonts.bodyWeight,
              fontSize: 32,
              color: colors.foreground,
            }}
          >
            Body text sample — foreground on background at full contrast.
          </div>
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontWeight: fonts.bodyWeight,
              fontSize: 28,
              color: colors.muted,
            }}
          >
            Muted caption sample — secondary text should stay comfortably readable.
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontFamily: bodyFontFamily,
              fontWeight: fonts.captionWeight,
              fontSize: 30,
            }}
          >
            <span style={{ color: colors.accent }}>Accent link / label</span>
            <span style={{ color: colors.accentCyan }}>Accent cyan highlight</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
