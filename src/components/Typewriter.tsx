import { interpolate, useCurrentFrame } from "remotion";

// String-slicing typewriter, per remotion-best-practices text-animations
// guidance — never per-character opacity.
export const Typewriter: React.FC<{
  text: string;
  charFrames?: number;
  startFrame?: number;
  cursorBlinkFrames?: number;
  showCursor?: boolean;
}> = ({ text, charFrames = 2, startFrame = 0, cursorBlinkFrames = 16, showCursor = true }) => {
  const frame = useCurrentFrame();
  const typedChars = Math.max(0, Math.floor((frame - startFrame) / charFrames));
  const typedText = text.slice(0, Math.min(text.length, typedChars));
  const isDoneTyping = typedChars >= text.length;

  const cursorOpacity = interpolate(
    ((frame % cursorBlinkFrames) + cursorBlinkFrames) % cursorBlinkFrames,
    [0, cursorBlinkFrames / 2, cursorBlinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <span>
      {typedText}
      {showCursor && frame >= startFrame ? (
        <span style={{ opacity: isDoneTyping ? cursorOpacity : 1 }}>{"▌"}</span>
      ) : null}
    </span>
  );
};
