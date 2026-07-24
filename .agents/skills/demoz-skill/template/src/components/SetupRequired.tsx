import { AbsoluteFill } from "remotion";

// Shown by every composition while `brandReady` is false (see withBrandGate).
// This is DELIBERATELY un-branded: the kit must not present a "default look"
// before the user's brand is confirmed and verified. It uses neutral system
// styling on purpose — do NOT wire the brand theme tokens into this screen.
const INK = "#E6E8EC";
const DIM = "#8A93A1";
const PANEL = "#0E1116";
const SYSTEM_FONT =
  "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

const STEPS = [
  "Add your logo and brand media to brand-input/.",
  "Point the agent at your brand kit.",
  "Approve the proposed palette — it is written and contrast-verified.",
];

export const SetupRequired: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PANEL,
        color: INK,
        fontFamily: SYSTEM_FONT,
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
        textAlign: "center",
      }}
    >
      <div style={{ letterSpacing: "0.42em", fontSize: 22, color: DIM }}>
        DEMOZ
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24 }}>
        Brand not set
      </div>
      <div style={{ fontSize: 30, color: DIM, marginTop: 20, maxWidth: 1120 }}>
        This kit has no default look. Complete the 3-step onboarding to render
        your brand.
      </div>
      <ol
        style={{
          marginTop: 56,
          textAlign: "left",
          fontSize: 30,
          lineHeight: 1.8,
          color: INK,
          maxWidth: 1120,
        }}
      >
        {STEPS.map((step, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            {step}
          </li>
        ))}
      </ol>
      <div style={{ marginTop: 56, fontSize: 26, color: DIM }}>
        Run <code style={{ color: INK }}>npm run brand:extract</code>
      </div>
    </AbsoluteFill>
  );
};
