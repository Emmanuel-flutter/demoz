import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";
import { bodyFontFamily, monoFontFamily } from "../fonts";
import { enterProgress } from "../animation";
import { Backdrop } from "./Backdrop";
import { Typewriter } from "./Typewriter";

const CHROME_DOT_COLORS = ["#FF5F57", "#FEBC2E", "#28C840"];

// No opacity fade-in by design (when entered via a TransitionSeries fade() —
// see TitleCard.tsx for why); a scale-in reads as an entrance without
// compounding, matching ScreenRecordingFrame's convention.
export const TerminalCard: React.FC<{
  command: string;
  commandStartFrame?: number;
  outputLines: string[];
  outputStartFrame: number;
  outputStagger?: number;
}> = ({
  command,
  commandStartFrame = 15,
  outputLines,
  outputStartFrame,
  outputStagger = 10,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scale = interpolate(enterProgress(frame, 20), [0, 1], [0.96, 1]);
  const windowWidth = width * 0.62;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: windowWidth,
            scale,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 40px 120px -20px ${colors.accent}55`,
            border: `1px solid ${colors.accentCyan}33`,
            backgroundColor: colors.backgroundElevated,
          }}
        >
          <div
            style={{
              height: 44,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 16px",
              backgroundColor: colors.backgroundElevated,
              borderBottom: `1px solid ${colors.accentCyan}22`,
            }}
          >
            {CHROME_DOT_COLORS.map((dotColor) => (
              <div
                key={dotColor}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                }}
              />
            ))}
          </div>
          <div
            style={{
              padding: "36px 40px 44px",
              fontFamily: monoFontFamily,
              fontSize: 26,
              lineHeight: 1.7,
              color: colors.foreground,
            }}
          >
            <div>
              <span style={{ color: colors.accentCyan }}>{"$ "}</span>
              <Typewriter
                text={command}
                charFrames={2}
                startFrame={commandStartFrame}
              />
            </div>
            {outputLines.map((line, i) => (
              <div
                key={i}
                style={{
                  color: colors.muted,
                  opacity: enterProgress(
                    frame,
                    10,
                    outputStartFrame + i * outputStagger,
                  ),
                  fontFamily: bodyFontFamily,
                  fontWeight: fonts.bodyWeight,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
