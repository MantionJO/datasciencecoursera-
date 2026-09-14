import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComponent}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
      calculateMetadata={calculateMetadata}
    />
  );
};

export const MyComponent: React.FC<Props> = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Scene"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        padding: 96,
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          opacity: interpolate(frame, [0, 1 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          fontSize: 96,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Hello, Remotion!
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          opacity: interpolate(frame, [0.7 * fps, 1.7 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          fontSize: 48,
          textAlign: "center",
          marginTop: 24,
        }}
      >
        A text composition made with code
      </Interactive.Div>
    </AbsoluteFill>
  );
};
