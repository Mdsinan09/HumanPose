import { Landmark } from '../types';

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

export function scoreSquat(landmarks: Landmark[]) {
  const visibleCount = landmarks.filter(l => l.visibility > 0.5).length;
  const score = Math.round((visibleCount / landmarks.length) * 100);
  const breakdown = {
    posture: Math.min(100, score + 5),
    balance: Math.max(0, score - 10),
    form: score,
  };
  return { overall: score, breakdown };
}

export function scorePushup(landmarks: Landmark[]) {
  return scoreSquat(landmarks); // Placeholder
}

export function scorePlank(landmarks: Landmark[]) {
  return scoreSquat(landmarks); // Placeholder
}

export default {
  calculateAngle,
  scoreSquat,
  scorePushup,
  scorePlank,
};