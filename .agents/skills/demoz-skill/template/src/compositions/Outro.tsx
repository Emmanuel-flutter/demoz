import { z } from "zod";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, colors, fonts } from "../theme";
import { headingFontFamily, bodyFontFamily } from "../fonts";
import { Backdrop } from "../components/Backdrop";
import { enterProgress } from "../animation";

export const OutroSchema = z.object({
  ctaText: z.string(),
});

// No opacity fade-in here by design: when composed inside FullWalkthrough's
// TransitionSeries, the `fade()` transition already fades this scene in —
// an additional internal opacity ramp would compound with it (multiplying,
// since CSS opacity is multiplicative through nested elements) and make the
// entrance visibly dimmer/slower than either animation intends on its own.
export const Outro: React.FC<z.infer<typeof OutroSchema>> = ({ ctaText }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const markScale = interpolate(enterProgress(frame, 30), [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        <Img
          src={staticFile(brand.logoMark)}
          style={{ height: 90, scale: markScale }}
        />
        <div
          style={{
            fontFamily: headingFontFamily,
            fontSize: 48,
            letterSpacing: "0.06em",
            color: colors.foreground,
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: width * 0.7,
          }}
        >
          {ctaText}
        </div>
        <div
          style={{
            fontFamily: bodyFontFamily,
            fontWeight: fonts.bodyWeight,
            fontSize: 24,
            color: colors.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {brand.parentBrand}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
