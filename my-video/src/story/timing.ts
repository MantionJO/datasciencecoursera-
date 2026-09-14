import { Scene, scenes } from "./script";

// Rough spoken-word pace for expressive French narration/dialogue.
// Real timing will shift once actual voice recordings replace this estimate.
const WORDS_PER_SECOND = 2.05;
const MIN_LINE_SECONDS = 1.8;
const GAP_SECONDS = 0.55;

export const INTRO_SECONDS = 30;
export const OUTRO_SECONDS = 60;

export const estimateLineSeconds = (line: Scene["lines"][number]) => {
  if (line.ambiance && line.durationSeconds !== undefined) {
    return line.durationSeconds;
  }
  const words = line.text.trim().split(/\s+/).length;
  return Math.max(MIN_LINE_SECONDS, words / WORDS_PER_SECOND);
};

export type LineTimeline = {
  line: Scene["lines"][number];
  from: number;
  durationInFrames: number;
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
    const lines: LineTimeline[] = scene.lines.map((line) => {
      const durationInFrames = Math.round(
        (estimateLineSeconds(line) + GAP_SECONDS) * fps,
      );
      const from = sceneCursor;
      sceneCursor += durationInFrames;
      return { line, from, durationInFrames };
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
