import { z } from "zod";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";
import { bodyFontFamily } from "../fonts";
import { Backdrop } from "../components/Backdrop";
import { enterProgress } from "../animation";

export const ScreenRecordingFrameSchema = z.object({
  mediaSrc: z.string(),
  mediaType: z.enum(["image", "video"]),
  addressBarLabel: z.string(),
});

export const ScreenRecordingFrame: React.FC<z.infer<typeof ScreenRecordingFrameSchema>> = ({
  mediaSrc,
  mediaType,
  addressBarLabel,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const scale = interpolate(enterProgress(frame, 24), [0, 1], [0.96, 1]);

  const frameWidth = width * 0.68;
  const frameHeight = height * 0.58;
  const chromeBarHeight = 44;
  const resolvedSrc = mediaSrc.startsWith("http") ? mediaSrc : staticFile(mediaSrc);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: frameWidth,
            height: frameHeight,
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
              height: chromeBarHeight,
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
                backgroundColor: colors.background,
                padding: "4px 14px",
                borderRadius: 6,
                flex: 1,
              }}
            >
              {addressBarLabel}
            </div>
          </div>
          <div style={{ width: "100%", height: frameHeight - chromeBarHeight }}>
            {mediaType === "video" ? (
              <OffthreadVideo
                src={resolvedSrc}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Img
                src={resolvedSrc}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
