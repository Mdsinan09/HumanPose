import { useEffect, useRef } from 'react';
import drawSkeleton from '../../utils/skeletalDrawing';
import { Landmark } from '../../types';

interface FrameLike {
  frame_number?: number;
  timestamp?: number;
  landmarks: Landmark[];
  score?: number;
  feedback?: unknown[];
}

interface Props {
  src: string;
  overlayFrames?: FrameLike[];
  onReady?: (videoEl: HTMLVideoElement) => void;
}

export default function VideoPlayerWithOverlay({ src, overlayFrames = [], onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const handleLoaded = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (onReady) onReady(video);
      drawCurrent();
    };

    const handleTime = () => drawCurrent();

    const drawCurrent = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let landmarks: Landmark[] = [];
      if (overlayFrames.length > 0) {
        const t = video.currentTime;
        let nearest = overlayFrames[0];
        let bestDiff = Math.abs((nearest?.timestamp || 0) - t);
        
        for (const f of overlayFrames) {
          const diff = Math.abs((f.timestamp || 0) - t);
          if (diff < bestDiff) {
            nearest = f;
            bestDiff = diff;
          }
        }
        
        if (nearest) {
          landmarks = nearest.landmarks;
        }
      }

      if (landmarks && landmarks.length > 0) {
        drawSkeleton(canvas, landmarks);
      }
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('timeupdate', handleTime);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('timeupdate', handleTime);
    };
  }, [overlayFrames, onReady]);

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded-lg bg-black"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}