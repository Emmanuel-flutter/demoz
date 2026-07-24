import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A 0->1 ramp (ease-out cubic by default) starting at `from` (default 0) and
// lasting `durationInFrames`. Use for staggered entrances (fade/translate/scale in).
export const enterProgress = (
  frame: number,
  durationInFrames: number,
  from = 0,
  easing: (input: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    ...clamp,
    easing,
  });

// A 1->0 linear ramp over `durationInFrames`, ending `endOffset` frames
// before `totalDuration`. Use for whole-scene exits that aren't already
// covered by an outer TransitionSeries fade (which handles the fade itself —
// stacking this on top would compound the two opacities multiplicatively).
export const exitProgress = (
  frame: number,
  totalDuration: number,
  durationInFrames: number,
  endOffset = 0,
) =>
  interpolate(
    frame,
    [totalDuration - endOffset - durationInFrames, totalDuration - endOffset],
    [1, 0],
    clamp,
  );
