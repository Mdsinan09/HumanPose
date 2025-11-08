import { useEffect, useRef } from 'react';

interface Props {
  frames: any[];
  onFrameSelect: (index: number) => void;
}

export default function ScoreTimeline({ frames, onFrameSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !frames.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 150;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}`, padding - 10, y + 4);
    }

    // Line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    frames.forEach((frame, i) => {
      // Extract score from frame - handle both nested and flat structures
      const frameScore = frame.score?.overall || frame.score || 0;
      const x = padding + (graphWidth / (frames.length - 1)) * i;
      const y = padding + graphHeight - (frameScore / 100) * graphHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Points
    frames.forEach((frame, i) => {
      // Extract score from frame - handle both nested and flat structures
      const frameScore = frame.score?.overall || frame.score || 0;
      const x = padding + (graphWidth / (frames.length - 1)) * i;
      const y = padding + graphHeight - (frameScore / 100) * graphHeight;

      ctx.fillStyle = frameScore >= 80 ? '#10B981' : frameScore >= 60 ? '#F59E0B' : '#EF4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X-axis
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const labelStep = Math.ceil(frames.length / 5);
    for (let i = 0; i < frames.length; i += labelStep) {
      const x = padding + (graphWidth / (frames.length - 1)) * i;
      // Handle timestamp - might be in frame data or calculate from frame number
      const time = frames[i].timestamp || (frames[i].frame / 30); // Default 30 fps
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, x, height - 10);
    }

  }, [frames]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 40;
    const graphWidth = canvas.width - padding * 2;
    
    const frameIndex = Math.round(((x - padding) / graphWidth) * (frames.length - 1));
    if (frameIndex >= 0 && frameIndex < frames.length) {
      onFrameSelect(frameIndex);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="w-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{ height: '150px' }}
      />
      <p className="text-center text-sm text-gray-500 mt-2">
        Click on the timeline to view frame details
      </p>
    </div>
  );
}