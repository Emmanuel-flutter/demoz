import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { headingFontFamily, bodyFontFamily } from "../fonts";
import { enterProgress, exitProgress } from "../animation";

export const LowerThirdSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accentColor: zColor(),
});

export const LowerThird: React.FC<z.infer<typeof LowerThirdSchema>> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { height, durationInFrames } = useVideoConfig();

  const enter = enterProgress(frame, 18);
  const exit = exitProgress(frame, durationInFrames, 15);
  const progress = Math.min(enter, exit);
  const translateX = interpolate(progress, [0, 1], [-40, 0]);
  const opacity = progress;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div
        style={{
          margin: "0 0 8% 6%",
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity,
          translate: `${translateX}px 0px`,
          maxWidth: "60%",
        }}
      >
        <div style={{ width: 6, height: height * 0.09, backgroundColor: accentColor }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: headingFontFamily,
              fontSize: 34,
              color: colors.foreground,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: bodyFontFamily,
              fontWeight: fonts.bodyWeight,
              fontSize: 22,
              color: colors.muted,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
