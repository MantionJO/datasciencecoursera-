import { Scene, scenes } from "./script";
import audioManifest from "./audioManifest.json";

// Fallback pace for any line that has no generated audio yet (e.g. a new
// line added after the last voiceover generation run).
const WORDS_PER_SECOND = 2.05;
const MIN_LINE_SECONDS = 1.8;
const GAP_SECONDS = 0.55;

export const INTRO_SECONDS = 30;
export const OUTRO_SECONDS = 60;

const estimateFromWordCount = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(MIN_LINE_SECONDS, words / WORDS_PER_SECOND);
};

export const getLineAudio = (sceneId: string, lineIndex: number) => {
  const entry = (audioManifest.scenes as Record<string, Record<string, { file: string; durationSeconds: number }>>)[
    sceneId
  ]?.[String(lineIndex)];
  return entry ?? null;
};

export const outroProverbAudio = audioManifest.outroProverb;

const lineSeconds = (line: Scene["lines"][number], sceneId: string, lineIndex: number) => {
  if (line.ambiance && line.durationSeconds !== undefined) {
    return line.durationSeconds;
  }
  const audio = getLineAudio(sceneId, lineIndex);
  if (audio) {
    return audio.durationSeconds;
  }
  return estimateFromWordCount(line.text);
};

export type LineTimeline = {
  line: Scene["lines"][number];
  from: number;
  durationInFrames: number;
  audioFile: string | null;
};

export type SceneTimeline = {
  scene: Scene;
  from: number;
  durationInFrames: number;
  lines: LineTimeline[];
};

export type Timeline = {
  introDurationInFrames: number;
  sceneTimelines: SceneTimeline[];
  outroFrom: number;
  outroDurationInFrames: number;
  totalDurationInFrames: number;
};

export const buildTimeline = (fps: number): Timeline => {
  const introDurationInFrames = Math.round(INTRO_SECONDS * fps);
  let cursor = introDurationInFrames;

  const sceneTimelines: SceneTimeline[] = scenes.map((scene) => {
    let sceneCursor = 0;
    const lines: LineTimeline[] = scene.lines.map((line, lineIndex) => {
      const durationInFrames = Math.round(
        (lineSeconds(line, scene.id, lineIndex) + GAP_SECONDS) * fps,
      );
      const from = sceneCursor;
      sceneCursor += durationInFrames;
      const audio = line.ambiance ? null : getLineAudio(scene.id, lineIndex);
      return { line, from, durationInFrames, audioFile: audio?.file ?? null };
    });

    const from = cursor;
    cursor += sceneCursor;
    return { scene, from, durationInFrames: sceneCursor, lines };
  });

  const outroFrom = cursor;
  const outroDurationInFrames = Math.round(OUTRO_SECONDS * fps);
  cursor += outroDurationInFrames;

  return {
    introDurationInFrames,
    sceneTimelines,
    outroFrom,
    outroDurationInFrames,
    totalDurationInFrames: cursor,
  };
};
