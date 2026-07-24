import "dotenv/config";
import { fal } from "@fal-ai/client";
import fs from "node:fs";
import path from "node:path";

// BYOK: media generation needs your own provider key. The brand EXTRACTION step
// does NOT need a key (the agent reads your media in-session).
if (!process.env.FAL_KEY) {
  throw new Error(
    "FAL_KEY is not set. Media generation is bring-your-own-key. Copy .env.example to " +
      ".env and set FAL_KEY (get a fal.ai key at https://fal.ai/dashboard/keys). " +
      "This key is only needed for gen:video / gen:audio, not for brand extraction.",
  );
}

fal.config({ credentials: process.env.FAL_KEY });

export { fal };

export const downloadToFile = async (url: string, outPath: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  return outPath;
};

export const logQueueUpdate = (update: { status: string; logs?: { message: string }[] }) => {
  if (update.status === "IN_PROGRESS" && update.logs) {
    update.logs.forEach((log) => console.log(log.message));
  }
};
