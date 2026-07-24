import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";
import { headingFontFamily, bodyFontFamily } from "../fonts";
import { enterProgress } from "../animation";
import { Backdrop } from "./Backdrop";

// One big statement per frame, with an optional supporting subtitle revealed
// shortly after — follows the video-layout rule of one focal message per scene.
//
// No opacity fade here by design: when this scene is entered via a
// TransitionSeries fade(), that already fades the whole scene in — an internal
// opacity ramp on top would compound multiplicatively and read dimmer/slower
// than intended (see Outro.tsx for the same rationale). translateY alone still
// reads as a clear entrance.
export const TitleCard: React.FC<{
  title: string;
  subtitle?: string;
  subtitleDelay?: number;
}> = ({ title, subtitle, subtitleDelay = 20 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const titleProgress = enterProgress(frame, 24);
  const titleTranslateY = interpolate(titleProgress, [0, 1], [20, 0]);
  const subtitleTranslateY = subtitle
    ? interpolate(enterProgress(frame, 24, subtitleDelay), [0, 1], [16, 0])
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: `0 ${width * 0.1}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: headingFontFamily,
              fontWeight: fonts.headingWeight,
              fontSize: 96,
              lineHeight: 1.15,
              letterSpacing: fonts.letterSpacingHeading,
              color: colors.foreground,
              translate: `0px ${titleTranslateY}px`,
              maxWidth: width * 0.8,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontFamily: bodyFontFamily,
                fontWeight: fonts.bodyWeight,
                fontSize: 44,
                color: colors.accentCyan,
                translate: `0px ${subtitleTranslateY}px`,
                maxWidth: width * 0.7,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
