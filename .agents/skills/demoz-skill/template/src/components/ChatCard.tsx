import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { bodyFontFamily } from "../fonts";
import { enterProgress } from "../animation";
import { Backdrop } from "./Backdrop";
import { Typewriter } from "./Typewriter";

// Shows a tool working inside a chat-style window — useful for a "prompt →
// response → ready" beat. Styled consistently with the other window cards (ScreenRecordingFrame,
// TerminalCard) rather than replicating Claude's actual UI chrome, since this
// video is dark-themed throughout.
//
// No opacity fade-in on the card itself, for the same reason as TitleCard/
// TerminalCard: it's entered via a TransitionSeries fade().
export const ChatCard: React.FC<{
  userMessage: string;
  userMessageStartFrame?: number;
  responseLines: string[];
  responseStartFrame: number;
  responseStagger?: number;
  readyLabel: string;
  readyStartFrame: number;
}> = ({
  userMessage,
  userMessageStartFrame = 10,
  responseLines,
  responseStartFrame,
  responseStagger = 18,
  readyLabel,
  readyStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cardScale = interpolate(enterProgress(frame, 20), [0, 1], [0.96, 1]);
  const cardWidth = width * 0.62;

  const readyProgress = enterProgress(frame, 16, readyStartFrame);
  const readyScale = interpolate(readyProgress, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 32 }}
      >
        <div
          style={{
            width: cardWidth,
            scale: cardScale,
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
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FEBC2E" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#28C840" }} />
            <div
              style={{
                marginLeft: 16,
                fontFamily: bodyFontFamily,
                fontWeight: fonts.bodyWeight,
                fontSize: 14,
                color: colors.muted,
              }}
            >
              Claude Code
            </div>
          </div>
          <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "80%",
                  backgroundColor: colors.accent,
                  color: colors.foreground,
                  borderRadius: 14,
                  padding: "14px 20px",
                  fontFamily: bodyFontFamily,
                  fontWeight: fonts.bodyWeight,
                  fontSize: 24,
                }}
              >
                <Typewriter text={userMessage} charFrames={1.4} startFrame={userMessageStartFrame} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {responseLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    opacity: enterProgress(frame, 12, responseStartFrame + i * responseStagger),
                    fontFamily: bodyFontFamily,
                    fontWeight: fonts.bodyWeight,
                    fontSize: 22,
                    color: colors.muted,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            opacity: readyProgress,
            scale: readyScale,
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.backgroundElevated,
            border: `1px solid ${colors.accentCyan}55`,
            borderRadius: 999,
            padding: "14px 28px",
          }}
        >
          <span style={{ color: colors.accentCyan, fontSize: 24 }}>{"✓"}</span>
          <span
            style={{
              fontFamily: bodyFontFamily,
              fontWeight: fonts.bodyWeight,
              fontSize: 24,
              color: colors.foreground,
            }}
          >
            {readyLabel}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
