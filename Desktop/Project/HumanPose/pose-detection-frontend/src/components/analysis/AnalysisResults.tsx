import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AnalysisResult } from '../../types';
import { useEffect, useRef } from 'react';
import { Landmark } from '../../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisResults({ result, onReset }: Props) {
  const { score, feedback, angles } = result.data;

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <button onClick={onReset} className="btn-secondary">
          <ArrowPathIcon className="w-5 h-5 mr-2 inline" />
          Analyze Another
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Overall Score</h3>
          <div className="relative w-32 h-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - score.overall / 100)}`}
                className="text-blue-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold">{score.overall}</span>
            </div>
          </div>
          <p className="text-gray-400 mt-4">
            {score.overall >= 80 ? 'Excellent!' : score.overall >= 60 ? 'Good' : 'Needs Improvement'}
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(score.breakdown || {}).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold">{value}/100</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {angles && Object.keys(angles).length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Joint Angles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(angles).map(([joint, angle]) => (
              <div key={joint} className="text-center p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400 capitalize mb-1">
                  {joint.replace('_', ' ')}
                </p>
                <p className="text-2xl font-bold text-blue-400">{angle}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Feedback</h3>
        <div className="space-y-3">
          {feedback.map((item: any, index: number) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                item.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : item.type === 'warning'
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {getFeedbackIcon(item.type)}
              <p className="flex-1">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkeletalOverlayProps {
  imageSrc: string;
  landmarks: Landmark[];
  connections: [number, number][];
}

export function SkeletalOverlay({ imageSrc, landmarks, connections }: SkeletalOverlayProps) {
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