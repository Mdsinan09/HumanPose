import { useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface Props {
  videoFile: File;
  frames: any[];
  onFrameChange: (frameIndex: number) => void;
}

export default function VideoPlayerWithAR({ videoFile, frames, onFrameChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      const currentFrameIndex = Math.floor((video.currentTime / video.duration) * frames.length);
      const frameData = frames[currentFrameIndex];

      if (frameData) {
        // Extract score - handle both nested and flat structures
        const frameScore = frameData.score?.overall || frameData.score || 0;
        drawAROverlay(ctx, { ...frameData, score: frameScore }, videoWidth, videoHeight);
        onFrameChange(currentFrameIndex);
      }

      requestAnimationFrame(drawFrame);
    };

    const handlePlay = () => drawFrame();
    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [frames, onFrameChange]);

  const drawAROverlay = (ctx: CanvasRenderingContext2D, frameData: any, width: number, height: number) => {
    // Extract landmarks - they might be in different formats
    let landmarks: any[] = [];
    if (frameData.landmarks) {
      // If landmarks is an object/dict, convert to array
      if (Array.isArray(frameData.landmarks)) {
        landmarks = frameData.landmarks;
      } else if (typeof frameData.landmarks === 'object') {
        // Convert object to array format
        landmarks = Object.values(frameData.landmarks).filter((lm: any) => lm && typeof lm === 'object');
      }
    }
    
    const score = frameData.score?.overall || frameData.score || 0;

    // Only draw AR overlay if we have landmarks
    if (landmarks.length > 0) {
      const connections = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 23], [12, 24], [23, 24],
        [23, 25], [24, 26], [25, 27], [26, 28],
      ];

      ctx.strokeStyle = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
      ctx.lineWidth = 4;

      connections.forEach(([start, end]) => {
        const startLm = landmarks[start];
        const endLm = landmarks[end];
        if (startLm && endLm && startLm.x !== undefined && startLm.y !== undefined) {
          ctx.beginPath();
          ctx.moveTo(startLm.x * width, startLm.y * height);
          ctx.lineTo(endLm.x * width, endLm.y * height);
          ctx.stroke();
        }
      });

      landmarks.forEach((lm: any) => {
        if (lm && lm.x !== undefined && lm.y !== undefined) {
          const x = lm.x * width;
          const y = lm.y * height;
          
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

    // Draw score overlay
    const roundedScore = Math.round(score);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 20, 120, 60);
    ctx.fillStyle = roundedScore >= 80 ? '#10B981' : roundedScore >= 60 ? '#F59E0B' : '#EF4444';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${roundedScore}`, 45, 58);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px sans-serif';
    ctx.fillText('SCORE', 80, 58);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden bg-black" style={{ maxHeight: '600px' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="hidden"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[600px] object-contain"
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <PlayIcon className="w-10 h-10 text-white ml-1" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={(e) => {
            const video = videoRef.current;
            if (video) {
              video.currentTime = parseFloat(e.target.value);
              setCurrentTime(video.currentTime);
            }
          }}
          className="w-full"
        />
        
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            {isPlaying ? (
              <>
                <PauseIcon className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Play
              </>
            )}
          </button>
          
          <span className="text-sm text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}