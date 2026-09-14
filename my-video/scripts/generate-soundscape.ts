// Generates original, procedurally-synthesized music and ambience/SFX beds
// for "Le Mouton de Vieux Dago" using only ffmpeg's built-in audio
// generators (sine tones + filtered/enveloped noise) — no samples, no
// network access, no licensing concerns. These are stylized/abstract beds
// (a market "murmur" texture, not literal recorded bleats or voices), meant
// to fill the sound-design slots called for in the production notes until
// real Foley/music replaces them.
//
// Requires the `ffmpeg`/`ffprobe` binaries on PATH.
//
// Usage:
//   bun run scripts/generate-soundscape.ts
//
// Writes MP3s under public/audio/{music,sfx}/ and a manifest to
// src/story/soundscapeManifest.json, which timing.ts and
// DramaComposition.tsx read to play them in the right place.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SAMPLE_RATE = 44100;
const PUBLIC_MUSIC = join(import.meta.dirname, "..", "public", "audio", "music");
const PUBLIC_SFX = join(import.meta.dirname, "..", "public", "audio", "sfx");
const MANIFEST_PATH = join(import.meta.dirname, "..", "src", "story", "soundscapeManifest.json");
const TMP_DIR = join(import.meta.dirname, ".tmp-soundscape");

let tmpCounter = 0;
const tmpWav = () => join(TMP_DIR, `t${tmpCounter++}.wav`);

// ---------- primitives ----------

/** A short, decaying pitched tone (fundamental + quiet octave shimmer). */
const synthNote = (freq: number, dur: number, volume: number): string => {
  const out = tmpWav();
  const decayStart = Math.max(0.02, dur * 0.12);
  const filter =
    `[0:a]volume=1.0[a];[1:a]volume=0.3[b];` +
    `[a][b]amix=inputs=2:duration=first:normalize=0,` +
    `afade=t=in:d=0.008,afade=t=out:st=${decayStart}:d=${dur - decayStart}:curve=exp,` +
    `volume=${volume}`;
  execFileSync("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `sine=frequency=${freq}:duration=${dur}:sample_rate=${SAMPLE_RATE}`,
    "-f", "lavfi", "-i", `sine=frequency=${freq * 2}:duration=${dur}:sample_rate=${SAMPLE_RATE}`,
    "-filter_complex", filter,
    out,
  ]);
  return out;
};

/** A continuous filtered-noise texture bed. */
const synthBed = (dur: number, volume: number, filterChain: string, color: "white" | "pink" | "brown" = "pink"): string => {
  const out = tmpWav();
  execFileSync("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `anoisesrc=color=${color}:duration=${dur}:sample_rate=${SAMPLE_RATE}`,
    "-af", `${filterChain},volume=${volume}`,
    out,
  ]);
  return out;
};

/** A short percussive noise hit (thud/crash/click) with a fast decay. */
const synthHit = (dur: number, volume: number, filterChain: string, color: "white" | "pink" | "brown" = "brown"): string => {
  const out = tmpWav();
  execFileSync("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `anoisesrc=color=${color}:duration=${dur}:sample_rate=${SAMPLE_RATE}`,
    "-af", `${filterChain},afade=t=out:st=0:d=${dur}:curve=exp,volume=${volume}`,
    out,
  ]);
  return out;
};

type Layer = { file: string; delaySec: number; volume?: number };

/** Mixes layers onto one timeline, trims to durationSec, writes mp3. */
const mixToMp3 = (layers: Layer[], durationSec: number, outPath: string) => {
  const inputs = layers.flatMap((l) => ["-i", l.file]);
  const stages = layers.map(
    (l, i) =>
      `[${i}:a]adelay=${Math.round(l.delaySec * 1000)}:all=1,volume=${l.volume ?? 1}[l${i}]`,
  );
  const mixIn = layers.map((_, i) => `[l${i}]`).join("");
  const filter = `${stages.join(";")};${mixIn}amix=inputs=${layers.length}:duration=longest:normalize=0[mixed]`;

  const mixedWav = tmpWav();
  execFileSync("ffmpeg", [
    "-y", ...inputs,
    "-filter_complex", filter,
    "-map", "[mixed]",
    "-t", String(durationSec),
    mixedWav,
  ]);

  mkdirSync(join(outPath, ".."), { recursive: true });
  execFileSync("ffmpeg", [
    "-y", "-i", mixedWav,
    "-af", "volume=7dB,alimiter=limit=0.9",
    "-t", String(durationSec),
    "-codec:a", "libmp3lame", "-qscale:a", "3",
    outPath,
  ]);
};

const measureDuration = (path: string) =>
  parseFloat(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
      .toString()
      .trim(),
  );

// A minor pentatonic, around middle C.
const NOTES = { A3: 220.0, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, A2: 110.0 };

// ---------- compositions ----------

const composeIntroMusic = (outPath: string) => {
  const dur = 30;
  const layers: Layer[] = [];
  const barLen = 2;
  const barCount = Math.ceil(dur / barLen);
  for (let bar = 0; bar < barCount; bar++) {
    const t0 = bar * barLen;
    const pattern =
      bar % 2 === 0
        ? [
            { f: NOTES.A3, at: 0.0, d: 0.55, v: 0.3 },
            { f: NOTES.C4, at: 0.5, d: 0.45, v: 0.26 },
            { f: NOTES.E4, at: 1.0, d: 0.45, v: 0.26 },
            { f: NOTES.A4, at: 1.5, d: 0.55, v: 0.28 },
          ]
        : [
            { f: NOTES.G4, at: 0.0, d: 0.45, v: 0.26 },
            { f: NOTES.E4, at: 0.5, d: 0.45, v: 0.24 },
            { f: NOTES.C4, at: 1.0, d: 0.45, v: 0.24 },
            { f: NOTES.A3, at: 1.5, d: 0.65, v: 0.3 },
          ];
    for (const n of pattern) {
      if (t0 + n.at >= dur) continue;
      layers.push({ file: synthNote(n.f, n.d, n.v), delaySec: t0 + n.at, volume: 1 });
    }
    // soft shaker pulse once per bar
    const shakerAt = t0 + 1.0;
    if (shakerAt < dur) {
      layers.push({
        file: synthHit(0.08, 0.12, "bandpass=f=4000:width_type=h:w=3000", "white"),
        delaySec: shakerAt,
        volume: 1,
      });
    }
  }
  mixToMp3(layers, dur, outPath);
};

const composeOutroMusic = (outPath: string) => {
  const dur = 60;
  const layers: Layer[] = [];
  const phraseLen = 12;
  const phraseCount = Math.ceil(dur / phraseLen);
  for (let p = 0; p < phraseCount; p++) {
    const t0 = p * phraseLen;
    // low sustained drone for warmth
    if (t0 < dur) {
      layers.push({ file: synthNote(NOTES.A2, Math.min(phraseLen, dur - t0), 0.09), delaySec: t0, volume: 1 });
    }
    const phrase = [
      { f: NOTES.A3, at: 0.3, d: 1.8, v: 0.24 },
      { f: NOTES.C4, at: 3.2, d: 1.6, v: 0.2 },
      { f: NOTES.E4, at: 4.4, d: 1.2, v: 0.16 },
      { f: NOTES.G4, at: 6.8, d: 1.8, v: 0.22 },
      { f: NOTES.A4, at: 9.6, d: 2.2, v: 0.18 },
    ];
    for (const n of phrase) {
      if (t0 + n.at >= dur) continue;
      layers.push({ file: synthNote(n.f, n.d, n.v), delaySec: t0 + n.at, volume: 1 });
    }
  }
  mixToMp3(layers, dur, outPath);

  // Bake in the "fade out progressif" called for on the closing music.
  const faded = tmpWav().replace(/\.wav$/, ".mp3");
  execFileSync("ffmpeg", [
    "-y", "-i", outPath,
    "-af", `afade=t=out:st=${dur - 7}:d=7`,
    "-codec:a", "libmp3lame", "-qscale:a", "3",
    faded,
  ]);
  execFileSync("cp", [faded, outPath]);
};

const composeMaisonAmbiance = (outPath: string) => {
  const dur = 14;
  const layers: Layer[] = [
    { file: synthBed(dur, 0.12, "bandpass=f=1500:width_type=h:w=1200,tremolo=f=7:d=0.5", "pink"), delaySec: 0 },
    { file: synthHit(0.05, 0.15, "highpass=f=3000", "white"), delaySec: 2.3 },
    { file: synthHit(0.05, 0.13, "highpass=f=3500", "white"), delaySec: 5.1 },
    { file: synthHit(0.05, 0.14, "highpass=f=3200", "white"), delaySec: 9.7 },
    { file: synthHit(0.25, 0.35, "lowpass=f=200", "brown"), delaySec: 6.5 }, // calebasse posée
  ];
  mixToMp3(layers, dur, outPath);
};

const composeRouteAmbiance = (outPath: string) => {
  const dur = 18;
  const layers: Layer[] = [
    { file: synthBed(dur, 0.15, "lowpass=f=600,tremolo=f=0.15:d=0.4", "pink"), delaySec: 0 },
  ];
  let t = 0.4;
  let toggle = true;
  while (t < dur - 0.2) {
    layers.push({
      file: synthHit(0.06, 0.22, `bandpass=f=${toggle ? 2200 : 1900}:width_type=h:w=1600`, "white"),
      delaySec: t,
    });
    layers.push({
      file: synthHit(0.05, 0.18, `bandpass=f=${toggle ? 2600 : 2300}:width_type=h:w=1600`, "white"),
      delaySec: t + 0.12,
    });
    toggle = !toggle;
    t += 0.9;
  }
  mixToMp3(layers, dur, outPath);
};

const composeMarcheOpening = (outPath: string) => {
  const dur = 24;
  const layers: Layer[] = [
    { file: synthBed(dur, 0.16, "bandpass=f=900:width_type=h:w=1400,tremolo=f=0.6:d=0.35", "pink"), delaySec: 0 },
  ];
  const pings = [1.2, 3.4, 5.9, 8.1, 10.6, 13.2, 15.7, 18.1, 20.4, 22.6];
  const pitches = [420, 650, 980, 550, 1100, 720, 480, 900, 610, 1050];
  pings.forEach((at, i) => {
    layers.push({ file: synthNote(pitches[i], 0.22, 0.18), delaySec: at });
  });
  layers.push({ file: synthHit(0.3, 0.2, "lowpass=f=250", "brown"), delaySec: 7.5 }); // chien (abstract)
  layers.push({ file: synthHit(0.3, 0.18, "lowpass=f=250", "brown"), delaySec: 17.0 });
  mixToMp3(layers, dur, outPath);
};

const composeMarcheBrouhaha = (outPath: string) => {
  const dur = 18;
  const layers: Layer[] = [
    { file: synthBed(dur, 0.13, "bandpass=f=900:width_type=h:w=1300,tremolo=f=0.5:d=0.3", "pink"), delaySec: 0 },
  ];
  const pings = [2.0, 6.4, 10.1, 14.3];
  const pitches = [560, 890, 700, 1000];
  pings.forEach((at, i) => layers.push({ file: synthNote(pitches[i], 0.2, 0.15), delaySec: at }));
  mixToMp3(layers, dur, outPath);
};

const composeChase = (outPath: string) => {
  const dur = 38;
  const layers: Layer[] = [
    { file: synthBed(6, 0.14, "bandpass=f=1000:width_type=h:w=1500", "pink"), delaySec: 0 },
    { file: synthBed(26, 0.24, "bandpass=f=1100:width_type=h:w=1700,tremolo=f=1.2:d=0.4", "pink"), delaySec: 6 },
    { file: synthBed(6, 0.15, "bandpass=f=900:width_type=h:w=1300", "pink"), delaySec: 32 },
  ];
  const crashes = [7.5, 11.2, 15.8, 21.3, 26.0];
  for (const at of crashes) {
    layers.push({ file: synthHit(0.3, 0.4, "lowpass=f=180", "brown"), delaySec: at });
  }
  const splats = [9.1, 13.6, 18.4, 23.9, 28.5, 30.7];
  for (const at of splats) {
    layers.push({ file: synthHit(0.16, 0.3, "bandpass=f=500:width_type=h:w=400", "brown"), delaySec: at });
  }
  mixToMp3(layers, dur, outPath);
};

const composeRetourSilence = (outPath: string) => {
  const dur = 20;
  const layers: Layer[] = [
    { file: synthBed(dur, 0.04, "lowpass=f=300", "pink"), delaySec: 0 },
  ];
  let t = 1.0;
  while (t < dur - 0.3) {
    layers.push({ file: synthHit(0.1, 0.18, "lowpass=f=150", "brown"), delaySec: t });
    t += 1.3;
  }
  mixToMp3(layers, dur, outPath);
};

// ---------- main ----------

type ManifestEntry = { file: string; durationSeconds: number };

const main = () => {
  mkdirSync(TMP_DIR, { recursive: true });

  const introPath = join(PUBLIC_MUSIC, "intro.mp3");
  const outroPath = join(PUBLIC_MUSIC, "outro.mp3");
  console.log("Composing intro music...");
  composeIntroMusic(introPath);
  console.log("Composing outro music...");
  composeOutroMusic(outroPath);

  const ambianceTargets: { sceneId: string; lineIndex: number; compose: (outPath: string) => void }[] = [
    { sceneId: "maison", lineIndex: 0, compose: composeMaisonAmbiance },
    { sceneId: "route", lineIndex: 1, compose: composeRouteAmbiance },
    { sceneId: "marche", lineIndex: 0, compose: composeMarcheOpening },
    { sceneId: "marche", lineIndex: 13, compose: composeMarcheBrouhaha },
    { sceneId: "mouton-rebelle", lineIndex: 3, compose: composeChase },
    { sceneId: "retour", lineIndex: 0, compose: composeRetourSilence },
  ];

  const ambiance: Record<string, Record<number, ManifestEntry>> = {};
  for (const target of ambianceTargets) {
    console.log(`Composing ambiance: ${target.sceneId}[${target.lineIndex}]...`);
    const relFile = join(target.sceneId, `${target.lineIndex}.mp3`);
    const outPath = join(PUBLIC_SFX, relFile);
    target.compose(outPath);
    ambiance[target.sceneId] ??= {};
    ambiance[target.sceneId][target.lineIndex] = {
      file: join("audio", "sfx", relFile),
      durationSeconds: measureDuration(outPath),
    };
  }

  const manifest = {
    music: {
      intro: { file: join("audio", "music", "intro.mp3"), durationSeconds: measureDuration(introPath) },
      outro: { file: join("audio", "music", "outro.mp3"), durationSeconds: measureDuration(outroPath) },
    },
    ambiance,
  };

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  rmSync(TMP_DIR, { recursive: true, force: true });
  console.log(`\nDone. Manifest written to ${MANIFEST_PATH}`);
};

main();
