// Generates ElevenLabs TTS voiceover for every spoken line in the
// "Le Mouton de Vieux Dago" script (src/story/script.ts) and writes MP3s
// under public/voiceover/MoutonDeVieuxDago/, plus a manifest.json describing
// what was generated (used later to sync real audio durations into the
// composition via calculateMetadata).
//
// Usage:
//   ELEVENLABS_API_KEY=... node --strip-types scripts/generate-voiceover.ts
//
// Requires a real ElevenLabs voice ID per character in VOICE_IDS below —
// fill those in from https://elevenlabs.io/app/voice-library (or
// GET https://api.elevenlabs.io/v1/voices with your key) before running.
// Ambiance/SFX lines are skipped — those are sound design, not voice.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PROVERB, scenes } from "../src/story/script";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  throw new Error("Set ELEVENLABS_API_KEY before running this script.");
}

const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_ROOT = join(import.meta.dirname, "..", "public", "voiceover", "MoutonDeVieuxDago");

// TODO: replace with real ElevenLabs voice IDs matching the casting notes:
//  - Narrateur: posée, chaleureuse, rythme modéré
//  - Vieux Dago: grave, un peu râpeuse, débit lent et fier
//  - Sa femme: douce mais ferme, intonations moqueuses
//  - Koko la Solution: vive, rapide, ton espiègle
//  - Vendeur / Vendeuse: variées, exagérées, ton commercial
//  - Enfant vendeur d'eau: légère, innocente
//  - Un acheteur / Un passant: voix de complément, neutres
//  - Foule: laisser vide (à remplacer par de vrais bruitages de foule, pas de la TTS)
const VOICE_IDS: Record<string, string> = {
  "Narrateur": "REPLACE_WITH_VOICE_ID",
  "Vieux Dago": "REPLACE_WITH_VOICE_ID",
  "Sa femme": "REPLACE_WITH_VOICE_ID",
  "Koko la Solution": "REPLACE_WITH_VOICE_ID",
  "Vendeur": "REPLACE_WITH_VOICE_ID",
  "Vendeuse": "REPLACE_WITH_VOICE_ID",
  "Enfant vendeur d'eau": "REPLACE_WITH_VOICE_ID",
  "Un acheteur": "REPLACE_WITH_VOICE_ID",
  "Un passant": "REPLACE_WITH_VOICE_ID",
};

// "Foule" (crowd) lines are better as real/recorded crowd SFX than as a
// single TTS voice — skipped here by default.
const SKIP_SPEAKERS = new Set(["Ambiance", "Foule"]);

type ManifestEntry = {
  file: string;
  sceneId: string;
  speaker: string;
  text: string;
};

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const synthesize = async (text: string, voiceId: string): Promise<Buffer> => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `ElevenLabs error ${response.status} for voice ${voiceId}: ${await response.text()}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
};

const writeAudio = (relativePath: string, buffer: Buffer) => {
  const fullPath = join(OUTPUT_ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, buffer);
};

const main = async () => {
  const manifest: ManifestEntry[] = [];

  for (const scene of scenes) {
    let lineIndex = 0;
    for (const line of scene.lines) {
      if (line.ambiance || SKIP_SPEAKERS.has(line.speaker)) continue;

      const voiceId = VOICE_IDS[line.speaker];
      if (!voiceId || voiceId === "REPLACE_WITH_VOICE_ID") {
        throw new Error(
          `No ElevenLabs voice ID configured for speaker "${line.speaker}" — fill in VOICE_IDS.`,
        );
      }

      const relativePath = join(
        scene.id,
        `${String(lineIndex).padStart(2, "0")}-${slug(line.speaker)}.mp3`,
      );

      console.log(`[${scene.id}] ${line.speaker}: "${line.text.slice(0, 40)}..."`);
      const buffer = await synthesize(line.text, voiceId);
      writeAudio(relativePath, buffer);
      manifest.push({ file: relativePath, sceneId: scene.id, speaker: line.speaker, text: line.text });

      lineIndex += 1;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Outro proverb, spoken by the narrator.
  const proverbVoiceId = VOICE_IDS["Narrateur"];
  console.log(`[outro] Narrateur: "${PROVERB}"`);
  const proverbBuffer = await synthesize(PROVERB, proverbVoiceId);
  const proverbPath = join("outro", "proverb.mp3");
  writeAudio(proverbPath, proverbBuffer);
  manifest.push({ file: proverbPath, sceneId: "outro", speaker: "Narrateur", text: PROVERB });

  writeAudio("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));
  console.log(`\nDone. ${manifest.length} audio files written to ${OUTPUT_ROOT}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
