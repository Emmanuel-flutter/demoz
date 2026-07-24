import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";
import { headingFontFamily } from "../fonts";
import { enterProgress } from "../animation";

const popEasing = Easing.out(Easing.back(2));

// Punches in a short list of phrases one after another, each with a quick
// scale-pop — for a fast, urgent problem-statement beat.
//
// `startFrame` defaults past a typical incoming TransitionSeries fade() window:
// each phrase is fully transparent until its own pop, so if a phrase's pop
// overlapped the crossfade its opacity would compound multiplicatively with the
// transition's — starting after it avoids that. Opacity is still used here
// (unlike TitleCard/Outro) because it's load-bearing for the sequential reveal,
// not just decorative.
export const ProblemReveal: React.FC<{
  phrases: string[];
  stagger?: number;
  startFrame?: number;
}> = ({ phrases, stagger = 24, startFrame = 20 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}
    >
      {phrases.map((phrase, i) => {
        const progress = enterProgress(
          frame,
          14,
          startFrame + i * stagger,
          popEasing,
        );
        const scale = interpolate(progress, [0, 1], [0.85, 1]);
        return (
          <div
            key={i}
            style={{
              fontFamily: headingFontFamily,
              fontWeight: fonts.headingWeight,
              fontSize: 88,
              color:
                i === phrases.length - 1
                  ? colors.accentCyan
                  : colors.foreground,
              opacity: progress,
              scale,
            }}
          >
            {phrase}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
