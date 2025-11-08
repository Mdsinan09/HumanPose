import { Landmark } from '../types';

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
  [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
  [15, 17], [15, 19], [15, 21], [16, 18], [16, 20], [16, 22],
];

export function getColorByConfidence(confidence: number): string {
  if (confidence > 0.8) return '#00ff00';
  if (confidence > 0.5) return '#ffff00';
  return '#ff0000';
}

export function drawSkeleton(
  canvas: HTMLCanvasElement,
  landmarks: Landmark[],
  connections: [number, number][] = POSE_CONNECTIONS
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || !landmarks.length) return;

  // Draw connections
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  connections.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (!start || !end) return;
    if (start.visibility < 0.5 || end.visibility < 0.5) return;

    const avgConfidence = (start.visibility + end.visibility) / 2;
    ctx.strokeStyle = getColorByConfidence(avgConfidence);
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.strokeStyle;

    ctx.beginPath();
    ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
    ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
    ctx.stroke();
  });

  ctx.shadowBlur = 0;

  // Draw landmarks
  landmarks.forEach((point) => {
    if (point.visibility < 0.5) return;

    ctx.beginPath();
    ctx.arc(
      point.x * canvas.width,
      point.y * canvas.height,
      6,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = getColorByConfidence(point.visibility);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

export default drawSkeleton;