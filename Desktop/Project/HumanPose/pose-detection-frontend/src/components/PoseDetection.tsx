import { useStablePoseCamera } from "../hooks/useStablePoseCamera";

interface Props {
  onPose: (landmarks: any) => void;
}

export default function PoseDetection({ onPose }: Props) {
  const { videoRef, canvasRef, isReady } = useStablePoseCamera(onPose);

  return (
    <div className="flex justify-center">
      <div style={{ position: "relative", width: 640, height: 480 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="rounded-lg border border-gray-700"
          style={{
            transform: "scaleX(-1)",
            objectFit: "cover",
            maxWidth: "100%",
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-white text-lg">Loading camera...</div>
          </div>
        )}
      </div>
    </div>
  );
}