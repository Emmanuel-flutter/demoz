import { z } from "zod";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";
import { Backdrop } from "../components/Backdrop";
import { Logo } from "../components/Logo";
import { enterProgress, exitProgress } from "../animation";

export const IntroSchema = z.object({});

export const Intro: React.FC<z.infer<typeof IntroSchema>> = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const markOpacity = enterProgress(frame, 20);
  const markTranslateY = interpolate(enterProgress(frame, 24), [0, 1], [24, 0]);
  const wordmarkOpacity = enterProgress(frame, 22, 10, Easing.linear);
  const taglineOpacity = enterProgress(frame, 20, 26, Easing.linear);
  const exitOpacity = exitProgress(frame, durationInFrames, 14, 4);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, opacity: exitOpacity }}>
      <Backdrop width={width} height={height} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: width * 0.08,
        }}
      >
        <Logo
          markOpacity={markOpacity}
          markTranslateY={markTranslateY}
          wordmarkOpacity={wordmarkOpacity}
          taglineOpacity={taglineOpacity}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
