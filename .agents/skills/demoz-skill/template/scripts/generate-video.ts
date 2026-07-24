// Generate an AI video clip via your BYOK media provider (default: fal.ai,
// ByteDance Seedance 2.0). Use for B-roll / cinematic filler around real product
// screenshots — not a replacement for the Playwright screen captures.
//
// BYOK: the provider key comes from FAL_KEY in .env. The model comes from
// --model, then $VIDEO_MODEL, then the default below.
//
// Usage:
//   npm run gen:video -- --prompt "..." --out public/generated/video/clip.mp4
//   npm run gen:video -- --prompt "..." --resolution 1080p --duration 6 --aspect-ratio 16:9 --no-audio
//   npm run gen:video -- --prompt "..." --out ... --model <your-provider/model-slug>
import { downloadToFile, logQueueUpdate, requireFal } from "./fal-client";
import { parseEnumFlag, parseFlags, resolveModel, runCli } from "./cli-utils";

const RESOLUTIONS = ["480p", "720p", "1080p", "4k"] as const;
const DEFAULT_VIDEO_MODEL = "bytedance/seedance-2.0/text-to-video";

const main = async () => {
  const { flags, bools } = parseFlags(process.argv.slice(2));

  if (!flags.prompt || !flags.out) {
    console.error(
      'Usage: npm run gen:video -- --prompt "..." --out public/generated/video/clip.mp4 [--resolution 480p|720p|1080p|4k] [--duration auto|4-15] [--aspect-ratio 16:9] [--no-audio] [--model <slug>]',
    );
    process.exit(1);
  }

  const resolution = parseEnumFlag(
    flags.resolution,
    "resolution",
    RESOLUTIONS,
    "1080p",
  );
  const model = resolveModel(flags.model, "VIDEO_MODEL", DEFAULT_VIDEO_MODEL);

  const fal = requireFal();
  console.log(`Generating video via ${model}...`);
  const result = await fal.subscribe(model, {
    input: {
      prompt: flags.prompt,
      resolution,
      duration: flags.duration ?? "auto",
      aspect_ratio: flags["aspect-ratio"] ?? "16:9",
      generate_audio: !bools.has("no-audio"),
      bitrate_mode: "high",
    },
    logs: true,
    onQueueUpdate: logQueueUpdate,
  });

  const videoUrl = result.data.video.url as string;
  await downloadToFile(videoUrl, flags.out);
  console.log(`Saved video to ${flags.out} (seed: ${result.data.seed})`);
};

runCli(main);
