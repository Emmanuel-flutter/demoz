import "./index.css";
import { Composition, Folder } from "remotion";
import { Intro, IntroSchema } from "./compositions/Intro";
import { Outro, OutroSchema } from "./compositions/Outro";
import { LowerThird, LowerThirdSchema } from "./compositions/LowerThird";
import {
  ScreenRecordingFrame,
  ScreenRecordingFrameSchema,
} from "./compositions/ScreenRecordingFrame";
import {
  FullWalkthrough,
  FullWalkthroughSchema,
  FULL_WALKTHROUGH_DURATION,
} from "./compositions/FullWalkthrough";
import { Swatch, SwatchSchema } from "./compositions/Swatch";
import { withBrandGate } from "./components/withBrandGate";
import { brand, colors, motion } from "./theme";

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = motion.fps;

// Every composition is gated: it shows the "set up your brand" screen until the
// brand kit is confirmed and verified (brandReady). There is no default look.
const GatedFullWalkthrough = withBrandGate(FullWalkthrough);
const GatedIntro = withBrandGate(Intro);
const GatedOutro = withBrandGate(Outro);
const GatedLowerThird = withBrandGate(LowerThird);
const GatedScreenRecordingFrame = withBrandGate(ScreenRecordingFrame);
const GatedSwatch = withBrandGate(Swatch);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Full-Examples">
        <Composition
          id="FullWalkthrough"
          component={GatedFullWalkthrough}
          durationInFrames={FULL_WALKTHROUGH_DURATION}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={FullWalkthroughSchema}
          defaultProps={{
            title: "Feature Name",
            subtitle: "One line describing what the viewer is looking at",
            accentColor: colors.accent,
            mediaSrc: "screenshots/placeholder-product-ui.png",
            mediaType: "image" as const,
            addressBarLabel: "internal.company.com/product",
            ctaText: `Built with ${brand.name}`,
          }}
        />
      </Folder>
      <Folder name="Building-Blocks">
        <Composition
          id="Intro"
          component={GatedIntro}
          durationInFrames={motion.introDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={IntroSchema}
          defaultProps={{}}
        />
        <Composition
          id="Outro"
          component={GatedOutro}
          durationInFrames={motion.outroDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={OutroSchema}
          defaultProps={{
            ctaText: `Built with ${brand.name}`,
          }}
        />
        <Composition
          id="LowerThird"
          component={GatedLowerThird}
          durationInFrames={motion.lowerThirdDurationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={LowerThirdSchema}
          defaultProps={{
            title: "Feature Name",
            subtitle: "One line describing what the viewer is looking at",
            accentColor: colors.accent,
          }}
        />
        <Composition
          id="ScreenRecordingFrame"
          component={GatedScreenRecordingFrame}
          durationInFrames={150}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={ScreenRecordingFrameSchema}
          defaultProps={{
            mediaSrc: "screenshots/placeholder-product-ui.png",
            mediaType: "image" as const,
            addressBarLabel: "internal.company.com/product",
          }}
        />
      </Folder>
      <Folder name="Brand">
        {/* Preview the current brand profile: colour chips at real contrast,
            sample heading/body/muted text, and the logo on the background.
            Render a still to review a proposed palette:
              npx remotion still Swatch /tmp/swatch.png */}
        <Composition
          id="Swatch"
          component={GatedSwatch}
          durationInFrames={30}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          schema={SwatchSchema}
          defaultProps={{}}
        />
      </Folder>
    </>
  );
};
