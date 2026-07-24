// Generate voiceover, sound effects, or music via your BYOK media provider
// (default: fal.ai — ElevenLabs for speech/SFX, Google Lyria2 for music).
//
// BYOK: the provider key comes from FAL_KEY in .env. Each media type takes its
// model from --model, then its env var, then the default:
//   voiceover -> $AUDIO_TTS_MODEL   (default fal-ai/elevenlabs/tts/eleven-v3)
//   sfx       -> $AUDIO_SFX_MODEL   (default fal-ai/elevenlabs/sound-effects/v2)
//   music     -> $AUDIO_MUSIC_MODEL (default fal-ai/lyria2)
//
// Usage:
//   npm run gen:audio -- voiceover --text "..." --out public/generated/audio/narration.mp3 [--voice Aria] [--stability 0.5] [--model <slug>]
//   npm run gen:audio -- sfx --text "..." --out public/generated/audio/whoosh.mp3 [--duration 3] [--model <slug>]
//   npm run gen:audio -- music --text "..." --out public/generated/audio/theme.wav [--negative-prompt "vocals, low quality"] [--model <slug>]
//     (Lyria2 returns WAV data regardless of the --out extension you choose — use .wav to avoid confusion)
import { fal, downloadToFile, logQueueUpdate, requireFal } from "./fal-client";
import { parseFlags, parseNumberFlag, resolveModel, runCli } from "./cli-utils";

const DEFAULT_TTS_MODEL = "fal-ai/elevenlabs/tts/eleven-v3";
const DEFAULT_SFX_MODEL = "fal-ai/elevenlabs/sound-effects/v2";
const DEFAULT_MUSIC_MODEL = "fal-ai/lyria2";

const generateVoiceover = async (flags: Record<string, string>) => {
  if (!flags.text || !flags.out) {
    console.error(
      'Usage: npm run gen:audio -- voiceover --text "..." --out public/generated/audio/narration.mp3 [--voice Aria] [--stability 0.5] [--model <slug>]',
    );
    process.exit(1);
  }
  requireFal();
  const model = resolveModel(flags.model, "AUDIO_TTS_MODEL", DEFAULT_TTS_MODEL);
  console.log(`Generating voiceover via ${model}...`);
  const result = await fal.subscribe(model, {
    input: {
      text: flags.text,
      voice: flags.voice ?? "Aria",
      stability: parseNumberFlag(flags.stability, "stability") ?? 0.5,
      apply_text_normalization: "auto",
    },
    logs: true,
    onQueueUpdate: logQueueUpdate,
  });
  await downloadToFile(result.data.audio.url as string, flags.out);
  console.log(`Saved voiceover to ${flags.out}`);
};

const generateSfx = async (flags: Record<string, string>) => {
  if (!flags.text || !flags.out) {
    console.error(
      'Usage: npm run gen:audio -- sfx --text "..." --out public/generated/audio/whoosh.mp3 [--duration 3] [--model <slug>]',
    );
    process.exit(1);
  }
  requireFal();
  const model = resolveModel(flags.model, "AUDIO_SFX_MODEL", DEFAULT_SFX_MODEL);
  console.log(`Generating sound effect via ${model}...`);
  const result = await fal.subscribe(model, {
    input: {
      text: flags.text,
      duration_seconds: parseNumberFlag(flags.duration, "duration"),
    },
    logs: true,
    onQueueUpdate: logQueueUpdate,
  });
  await downloadToFile(result.data.audio.url as string, flags.out);
  console.log(`Saved sound effect to ${flags.out}`);
};

const generateMusic = async (flags: Record<string, string>) => {
  if (!flags.text || !flags.out) {
    console.error(
      'Usage: npm run gen:audio -- music --text "..." --out public/generated/audio/theme.wav [--negative-prompt "..."] [--model <slug>]',
    );
    process.exit(1);
  }
  requireFal();
  const model = resolveModel(
    flags.model,
    "AUDIO_MUSIC_MODEL",
    DEFAULT_MUSIC_MODEL,
  );
  console.log(`Generating music via ${model}...`);
  const result = await fal.subscribe(model, {
    input: {
      prompt: flags.text,
      negative_prompt: flags["negative-prompt"] ?? "low quality, vocals",
    },
    logs: true,
    onQueueUpdate: logQueueUpdate,
  });
  await downloadToFile(result.data.audio.url as string, flags.out);
  console.log(`Saved music to ${flags.out}`);
};

const main = async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const { flags } = parseFlags(rest);

  if (mode === "voiceover") return generateVoiceover(flags);
  if (mode === "sfx") return generateSfx(flags);
  if (mode === "music") return generateMusic(flags);

  console.error(
    'Usage: npm run gen:audio -- <voiceover|sfx|music> --text "..." --out <path>',
  );
  process.exit(1);
};

runCli(main);
