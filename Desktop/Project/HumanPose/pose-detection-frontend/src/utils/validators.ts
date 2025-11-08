export const validateScore = (score: number): boolean => {
    return score >= 0 && score <= 100;
};

export const validateLandmarks = (landmarks: number[]): boolean => {
    return landmarks.length === 33 && landmarks.every(landmark => typeof landmark === 'number');
};

export const validateFeedback = (feedback: string): boolean => {
    return feedback.length > 0 && feedback.length <= 500;
};

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB
}

export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024; // 100MB
}

export default {
  isValidImageFile,
  isValidVideoFile,
};