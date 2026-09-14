import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { PROVERB, SUBTITLE, TITLE } from "./story/script";
import {
  LineTimeline,
  SceneTimeline,
  buildTimeline,
  outroProverbAudio,
} from "./story/timing";

// Voices are placeholder speech synthesized locally with espeak-ng (see
// scripts/generate-voiceover-local.ts) — robotic, but real timed audio.
// Swap in scripts/generate-voiceover.ts (ElevenLabs) for final-quality
// voices later; the wiring below (<Audio> per line) stays the same.
//
// Intro/outro music, per-scene ambience and SFX are still not wired in —
// no licensed assets exist in this project. Once available, drop files
// under public/audio/ and add <Audio src={staticFile(...)}/> for those
// beats, matching the sound design notes.

type Props = {};

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  const timeline = buildTimeline(FPS);
  return { durationInFrames: timeline.totalDurationInFrames };
};

export const DramaComposition = () => {
  return (
    <Composition
      id="MoutonDeVieuxDago"
      component={DramaVideo}
      fps={FPS}
      width={1920}
      height={1080}
      durationInFrames={600}
      calculateMetadata={calculateMetadata}
    />
  );
};

const DramaVideo: React.FC<Props> = () => {
  const { fps } = useVideoConfig();
  const timeline = buildTimeline(fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1B1B2F" }}>
      <Sequence
        name="Intro"
        from={0}
        durationInFrames={timeline.introDurationInFrames}
        layout="none"
      >
        <IntroCard durationInFrames={timeline.introDurationInFrames} />
      </Sequence>

      {timeline.sceneTimelines.map((sceneTimeline) => (
        <Sequence
          key={sceneTimeline.scene.id}
          name={sceneTimeline.scene.title}
          from={sceneTimeline.from}
          durationInFrames={sceneTimeline.durationInFrames}
          layout="none"
        >
          <SceneView sceneTimeline={sceneTimeline} />
        </Sequence>
      ))}

      <Sequence
        name="Outro"
        from={timeline.outroFrom}
        durationInFrames={timeline.outroDurationInFrames}
        layout="none"
      >
        <OutroCard durationInFrames={timeline.outroDurationInFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

const IntroCard: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 1 * fps, durationInFrames - 1 * fps, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <AbsoluteFill
      name="IntroCard"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1B1B2F",
        opacity,
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          fontSize: 108,
          fontWeight: 700,
          color: "#F2C14E",
          textAlign: "center",
          padding: "0 160px",
        }}
      >
        {TITLE}
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          fontSize: 48,
          color: "#E8D9B5",
          marginTop: 32,
          textAlign: "center",
        }}
      >
        {SUBTITLE}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ sceneTimeline: SceneTimeline }> = ({
  sceneTimeline,
}) => {
  const { scene, lines } = sceneTimeline;

  return (
    <AbsoluteFill
      name={scene.title}
      style={{
        backgroundColor: scene.bg,
      }}
    >
      <Interactive.Div
        name="SceneLabel"
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          fontSize: 32,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: scene.accent,
          fontWeight: 700,
          opacity: 0.85,
        }}
      >
        {scene.title}
      </Interactive.Div>

      {lines.map((lineTimeline, index) => (
        <Sequence
          key={index}
          name={`Line ${index + 1}`}
          from={lineTimeline.from}
          durationInFrames={lineTimeline.durationInFrames}
          layout="none"
        >
          <LineCaption lineTimeline={lineTimeline} accent={scene.accent} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const LineCaption: React.FC<{
  lineTimeline: LineTimeline;
  accent: string;
}> = ({ lineTimeline, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { durationInFrames, line } = lineTimeline;
  const fadeFrames = Math.min(0.35 * fps, durationInFrames / 3);

  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const translate = interpolate(frame, [0, fadeFrames], ["0px 24px", "0px 0px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const isNarrator = line.speaker === "Narrateur";

  if (line.ambiance) {
    return (
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 220px 100px 220px",
        }}
      >
        <Interactive.Div
          name="Ambiance"
          style={{
            opacity: opacity * 0.75,
            translate,
            textAlign: "center",
            fontSize: 32,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#241C10",
            letterSpacing: 0.5,
          }}
        >
          {line.text}
        </Interactive.Div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 180px 140px 180px",
      }}
    >
      {lineTimeline.audioFile && <Audio src={staticFile(lineTimeline.audioFile)} />}
      <Interactive.Div
        name="Caption"
        style={{
          opacity,
          translate,
          textAlign: "center",
        }}
      >
        {!isNarrator && (
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: accent,
              marginBottom: 12,
            }}
          >
            {line.speaker}
          </div>
        )}
        <div
          style={{
            fontSize: isNarrator ? 42 : 52,
            fontStyle: isNarrator ? "italic" : "normal",
            fontWeight: isNarrator ? 400 : 600,
            color: "#241C10",
            lineHeight: 1.3,
          }}
        >
          {line.text}
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const OutroCard: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainOpacity = interpolate(frame, [0, 1 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 2 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Visual stand-in for the "light echo" called for on the proverb line —
  // real mix should use an audio echo/reverb on the recorded voice line.
  const echoStart = 2 * fps;
  const echo1Opacity = interpolate(
    frame,
    [echoStart, echoStart + 0.4 * fps, echoStart + 1.4 * fps],
    [0, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const echo2Opacity = interpolate(
    frame,
    [echoStart + 0.3 * fps, echoStart + 0.7 * fps, echoStart + 1.8 * fps],
    [0, 0.2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      name="OutroCard"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1B1B2F",
        opacity: mainOpacity * fadeOut,
        padding: "0 200px",
      }}
    >
      <Sequence from={Math.round(0.4 * fps)} layout="none">
        <Audio src={staticFile(outroProverbAudio.file)} />
      </Sequence>
      <Interactive.Div
        name="Proverb"
        style={{
          fontSize: 56,
          fontStyle: "italic",
          color: "#F2C14E",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {PROVERB}
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          fontSize: 56,
          fontStyle: "italic",
          color: "#F2C14E",
          textAlign: "center",
          lineHeight: 1.4,
          padding: "0 200px",
          opacity: echo1Opacity,
          scale: "1.03",
        }}
      >
        {PROVERB}
      </div>
      <div
        style={{
          position: "absolute",
          fontSize: 56,
          fontStyle: "italic",
          color: "#F2C14E",
          textAlign: "center",
          lineHeight: 1.4,
          padding: "0 200px",
          opacity: echo2Opacity,
          scale: "1.06",
        }}
      >
        {PROVERB}
      </div>
    </AbsoluteFill>
  );
};
