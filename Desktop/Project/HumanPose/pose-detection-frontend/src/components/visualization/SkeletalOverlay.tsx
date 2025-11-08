import { useEffect, useRef } from 'react';
import { Landmark } from '../../types';

interface Props {
  imageSrc: string;
  landmarks: Landmark[];
  connections: [number, number][];
}

export default function SkeletalOverlay({ imageSrc, landmarks, connections }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !landmarks.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    const drawOverlay = () => {
      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw connections (bones)
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      connections.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];
        
        if (startLandmark && endLandmark) {
          const startX = startLandmark.x * canvas.width;
          const startY = startLandmark.y * canvas.height;
          const endX = endLandmark.x * canvas.width;
          const endY = endLandmark.y * canvas.height;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });

      // Draw landmarks (joints)
      landmarks.forEach((landmark) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        // Circle color based on visibility/confidence
        const confidence = landmark.visibility || 1;
        const color = confidence > 0.7 ? '#10B981' : confidence > 0.5 ? '#F59E0B' : '#EF4444';
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    // Wait for image to load
    if (img.complete) {
      drawOverlay();
    } else {
      img.onload = drawOverlay;
    }
  }, [imageSrc, landmarks, connections]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Original"
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
      />
    </div>
  );
}