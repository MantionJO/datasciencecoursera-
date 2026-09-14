// Generates placeholder voiceover for every spoken line in the
// "Le Mouton de Vieux Dago" script using the local espeak-ng TTS engine
// (no API key / no ElevenLabs required). Voices are synthetic/robotic —
// this is meant to unblock timing/editing, not as final-quality dubbing.
// Swap in scripts/generate-voiceover.ts (ElevenLabs) later for real voices.
//
// Requires the `espeak-ng` and `ffmpeg` binaries on PATH.
//
// Usage:
//   node --strip-types scripts/generate-voiceover-local.ts
//
// Writes MP3s under public/voiceover/MoutonDeVieuxDago/ and a duration
// manifest to src/story/audioManifest.json, which timing.ts reads to size
// each line's on-screen duration to the actual synthesized audio.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PROVERB, scenes } from "../src/story/script";

const PUBLIC_ROOT = join(import.meta.dirname, "..", "public", "voiceover", "MoutonDeVieuxDago");
const MANIFEST_PATH = join(import.meta.dirname, "..", "src", "story", "audioManifest.json");
const TMP_DIR = join(import.meta.dirname, ".tmp-tts");

type VoiceProfile = {
  variant: string; // espeak-ng "fr+<variant>" voice
  pitch: number; // 0-99
  speed: number; // words per minute
  amplitude: number; // 0-200, volume
};

// Rough stand-ins for the casting notes, using espeak-ng's built-in
// variants (gender/age colour) plus pitch/speed/amplitude tweaks.
const VOICE_PROFILES: Record<string, VoiceProfile> = {
  "Narrateur": { variant: "m3", pitch: 45, speed: 105, amplitude: 100 },
  "Vieux Dago": { variant: "croak", pitch: 28, speed: 84, amplitude: 115 },
  "Sa femme": { variant: "f4", pitch: 62, speed: 109, amplitude: 100 },
  "Koko la Solution": { variant: "m5", pitch: 58, speed: 137, amplitude: 105 },
  "Vendeur": { variant: "m2", pitch: 50, speed: 133, amplitude: 118 },
  "Vendeuse": { variant: "f3", pitch: 68, speed: 133, amplitude: 118 },
  "Enfant vendeur d'eau": { variant: "f5", pitch: 80, speed: 119, amplitude: 100 },
  "Un acheteur": { variant: "m4", pitch: 48, speed: 105, amplitude: 100 },
  "Un passant": { variant: "m6", pitch: 42, speed: 109, amplitude: 100 },
  "Foule": { variant: "m2", pitch: 50, speed: 123, amplitude: 120 },
};

type ManifestEntry = { file: string; durationSeconds: number };
type Manifest = {
  scenes: Record<string, Record<number, ManifestEntry>>;
  outroProverb: ManifestEntry;
};

const synthesizeToMp3 = (text: string, profile: VoiceProfile, outMp3Path: string) => {
  mkdirSync(TMP_DIR, { recursive: true });
  const tmpWav = join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);

  execFileSync("espeak-ng", [
    "-v", `fr+${profile.variant}`,
    "-p", String(profile.pitch),
    "-s", String(profile.speed),
    "-a", String(profile.amplitude),
    "-w", tmpWav,
    text,
  ]);

  mkdirSync(dirname(outMp3Path), { recursive: true });
  execFileSync("ffmpeg", [
    "-y",
    "-i", tmpWav,
    "-codec:a", "libmp3lame",
    "-qscale:a", "4",
    outMp3Path,
  ]);

  const durationOutput = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    outMp3Path,
  ]).toString().trim();

  return parseFloat(durationOutput);
};

const main = () => {
  const manifest: Manifest = { scenes: {}, outroProverb: { file: "", durationSeconds: 0 } };

  for (const scene of scenes) {
    manifest.scenes[scene.id] = {};
    scene.lines.forEach((line, index) => {
      if (line.ambiance) return;

      const profile = VOICE_PROFILES[line.speaker];
      if (!profile) {
        throw new Error(`No voice profile configured for speaker "${line.speaker}".`);
      }

      const relativeFile = join(scene.id, `${index}.mp3`);
      const outPath = join(PUBLIC_ROOT, relativeFile);
      console.log(`[${scene.id}] ${line.speaker}: "${line.text.slice(0, 50)}..."`);
      const durationSeconds = synthesizeToMp3(line.text, profile, outPath);
      manifest.scenes[scene.id][index] = {
        file: join("voiceover", "MoutonDeVieuxDago", relativeFile),
        durationSeconds,
      };
    });
  }

  const proverbRelativeFile = join("outro", "proverb.mp3");
  console.log(`[outro] Narrateur: "${PROVERB}"`);
  const proverbDuration = synthesizeToMp3(
    PROVERB,
    VOICE_PROFILES["Narrateur"],
    join(PUBLIC_ROOT, proverbRelativeFile),
  );
  manifest.outroProverb = {
    file: join("voiceover", "MoutonDeVieuxDago", proverbRelativeFile),
    durationSeconds: proverbDuration,
  };

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  rmSync(TMP_DIR, { recursive: true, force: true });
  console.log(`\nDone. Manifest written to ${MANIFEST_PATH}`);
};

main();
