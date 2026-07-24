import { colors } from "../theme";

// A neutral, brand-agnostic backdrop: the solid brand `background` with a
// subtle off-centre radial glow tinted by `accent`. This is the default
// replacement for a brand-specific motif — a drop-in for any scene that wants a
// clean branded backdrop. Signature matches how scenes call it (width/height),
// though both are optional and it just fills its parent.
export const Backdrop: React.FC<{
  width?: number;
  height?: number;
}> = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.background,
        backgroundImage: [
          `radial-gradient(70% 60% at 80% 25%, ${colors.accent}26 0%, ${colors.background}00 60%)`,
          `radial-gradient(60% 55% at 15% 90%, ${colors.accentCyan}1A 0%, ${colors.background}00 55%)`,
        ].join(", "),
      }}
    />
  );
};
