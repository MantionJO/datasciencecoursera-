import "./index.css";
import { MyComposition } from "./Composition";
import { DramaComposition } from "./DramaComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <DramaComposition />
    </>
  );
};
