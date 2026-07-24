import { z } from "zod";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Intro } from "./Intro";
import { Outro, OutroSchema } from "./Outro";
import { LowerThird, LowerThirdSchema } from "./LowerThird";
import { ScreenRecordingFrame, ScreenRecordingFrameSchema } from "./ScreenRecordingFrame";
import { colors, motion } from "../theme";

// Composed from the same child schemas the scenes below actually use, so the
// prop names/types can't drift from what LowerThird/ScreenRecordingFrame/Outro
// require.
export const FullWalkthroughSchema = z.object({
  ...LowerThirdSchema.pick({ title: true, subtitle: true, accentColor: true }).shape,
  ...ScreenRecordingFrameSchema.shape,
  ...OutroSchema.shape,
});

const INTRO_DURATION = motion.introDurationInFrames;
const OUTRO_DURATION = motion.outroDurationInFrames;
const SCREEN_SECTION_DURATION = 150;
const TRANSITION_DURATION = 20;

// Root.tsx imports this so the Composition's declared durationInFrames can't
// drift out of sync with the section/transition constants above.
export const FULL_WALKTHROUGH_DURATION =
  INTRO_DURATION + SCREEN_SECTION_DURATION + OUTRO_DURATION - TRANSITION_DURATION * 2;

export const FullWalkthrough: React.FC<z.infer<typeof FullWalkthroughSchema>> = ({
  title,
  subtitle,
  accentColor,
  mediaSrc,
  mediaType,
  addressBarLabel,
  ctaText,
}) => {
  const { height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCREEN_SECTION_DURATION}>
          {/* paddingBottom reserves room for the LowerThird overlay below —
              this is specific to this composition's layout, not a general
              property of ScreenRecordingFrame (which is also used standalone). */}
          <AbsoluteFill style={{ paddingBottom: height * 0.16 }}>
            <ScreenRecordingFrame
              mediaSrc={mediaSrc}
              mediaType={mediaType}
              addressBarLabel={addressBarLabel}
            />
            <Sequence
              from={TRANSITION_DURATION}
              durationInFrames={SCREEN_SECTION_DURATION - TRANSITION_DURATION}
              layout="none"
            >
              <LowerThird title={title} subtitle={subtitle} accentColor={accentColor} />
            </Sequence>
          </AbsoluteFill>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={OUTRO_DURATION}>
          <Outro ctaText={ctaText} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
