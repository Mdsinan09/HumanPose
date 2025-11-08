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
      if (video.paused || video.ended) {
        // Still draw the current frame when paused
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        if (videoWidth > 0 && videoHeight > 0) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
          ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
          
          const currentFrameIndex = Math.floor((video.currentTime / video.duration) * frames.length);
          const frameData = frames[currentFrameIndex];
          
          if (frameData) {
            const frameScore = frameData.score?.overall || frameData.score || 0;
            drawAROverlay(ctx, { ...frameData, score: frameScore }, videoWidth, videoHeight);
          }
        }
        return;
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth > 0 && videoHeight > 0) {
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
      }

      requestAnimationFrame(drawFrame);
    };

    const handlePlay = () => drawFrame();
    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Draw initial frame with overlay
      if (frames.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const frameData = frames[0];
          if (frameData) {
            const frameScore = frameData.score?.overall || frameData.score || 0;
            drawAROverlay(ctx, { ...frameData, score: frameScore }, video.videoWidth, video.videoHeight);
          }
        }
      }
    };

    const handleTimeUpdate = () => {
      // Update overlay when scrubbing
      if (video.paused && frames.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const currentFrameIndex = Math.floor((video.currentTime / video.duration) * frames.length);
          const frameData = frames[currentFrameIndex];
          if (frameData) {
            const frameScore = frameData.score?.overall || frameData.score || 0;
            drawAROverlay(ctx, { ...frameData, score: frameScore }, video.videoWidth, video.videoHeight);
          }
        }
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [frames, onFrameChange]);

  const drawAROverlay = (ctx: CanvasRenderingContext2D, frameData: any, width: number, height: number) => {
    // Extract landmarks - they might be in different formats
    let landmarksMap: { [key: string]: any } = {};
    let landmarksArray: any[] = [];
    
    if (frameData.landmarks) {
      if (Array.isArray(frameData.landmarks)) {
        // If it's an array, convert to map by index
        frameData.landmarks.forEach((lm: any, idx: number) => {
          if (lm && typeof lm === 'object') {
            landmarksMap[idx.toString()] = lm;
            landmarksArray.push(lm);
          }
        });
      } else if (typeof frameData.landmarks === 'object') {
        // If it's an object/dict, use it directly
        landmarksMap = frameData.landmarks;
        landmarksArray = Object.values(frameData.landmarks).filter((lm: any) => lm && typeof lm === 'object');
      }
    }
    
    const score = frameData.score?.overall || frameData.score || 0;

    // Only draw AR overlay if we have landmarks
    if (landmarksArray.length > 0) {
      // MediaPipe pose connections (33 keypoints)
      // Format: [start_index, end_index]
      const connections = [
        // Face
        [0, 1], [1, 2], [2, 3], [3, 7],  // Face outline
        [0, 4], [4, 5], [5, 6], [6, 8],  // Face outline
        // Upper body
        [9, 10],  // Mouth
        [11, 12],  // Shoulders
        [11, 13], [13, 15],  // Left arm
        [12, 14], [14, 16],  // Right arm
        [11, 23], [12, 24],  // Shoulder to hip
        [23, 24],  // Hips
        // Lower body
        [23, 25], [25, 27],  // Left leg
        [24, 26], [26, 28],  // Right leg
        [27, 29], [29, 31],  // Left foot
        [28, 30], [30, 32],  // Right foot
      ];

      // Get landmark by index (handles both array and object formats)
      const getLandmark = (index: number) => {
        // Try array format first
        if (landmarksArray[index]) {
          return landmarksArray[index];
        }
        // Try object format with index as key
        if (landmarksMap[index.toString()]) {
          return landmarksMap[index.toString()];
        }
        // Try object format with landmark names
        const landmarkNames = [
          'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
          'right_eye_inner', 'right_eye', 'right_eye_outer',
          'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
          'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
          'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
          'left_index', 'right_index', 'left_thumb', 'right_thumb',
          'left_hip', 'right_hip', 'left_knee', 'right_knee',
          'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
          'left_foot_index', 'right_foot_index'
        ];
        if (index < landmarkNames.length && landmarksMap[landmarkNames[index]]) {
          return landmarksMap[landmarkNames[index]];
        }
        return null;
      };

      // Draw connections (skeleton lines)
      ctx.strokeStyle = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      connections.forEach(([startIdx, endIdx]) => {
        const startLm = getLandmark(startIdx);
        const endLm = getLandmark(endIdx);
        
        if (startLm && endLm && startLm.x !== undefined && startLm.y !== undefined && 
            endLm.x !== undefined && endLm.y !== undefined &&
            startLm.visibility > 0.5 && endLm.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startLm.x * width, startLm.y * height);
          ctx.lineTo(endLm.x * width, endLm.y * height);
          ctx.stroke();
        }
      });

      // Draw landmarks (joints)
      landmarksArray.forEach((lm: any) => {
        if (lm && lm.x !== undefined && lm.y !== undefined && lm.visibility > 0.5) {
          const x = lm.x * width;
          const y = lm.y * height;
          
          // Draw joint circle
          ctx.fillStyle = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw white border
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