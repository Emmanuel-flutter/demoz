import { brandReady } from "../theme";
import { SetupRequired } from "./SetupRequired";

// Wrap a composition so it renders the SetupRequired screen until the brand kit
// is confirmed and verified (brandReady === true, set by `brand:extract
// --promote`). This is what makes "no default look until the brand is set" true
// for EVERY registered composition, from one place.
export function withBrandGate<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const Gated: React.FC<P> = (props) =>
    brandReady ? <Component {...props} /> : <SetupRequired />;
  return Gated;
}
