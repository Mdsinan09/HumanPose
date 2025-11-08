import React, { useEffect, useRef } from 'react';

interface VideoCanvasProps {
  videoStream: MediaStream | null;
  poseData: any; // Replace with the appropriate type for pose data
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({ videoStream, poseData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play();
    }
  }, [videoStream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext('2d');
      const draw = () => {
        if (context && video) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Here you would draw the pose data on the canvas
          if (poseData) {
            // Example: draw landmarks
            poseData.landmarks.forEach((landmark: any) => {
              context.beginPath();
              context.arc(landmark.x, landmark.y, 5, 0, 2 * Math.PI);
              context.fillStyle = 'red';
              context.fill();
            });
          }
        }
        requestAnimationFrame(draw);
      };
      draw();
    }
  }, [poseData]);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
};

export default VideoCanvas;