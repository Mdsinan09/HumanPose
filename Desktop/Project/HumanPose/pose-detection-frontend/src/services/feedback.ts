import { Feedback } from '../types';

export function generateFeedback(score: number): Feedback[] {
  const feedback: Feedback[] = [];

  if (score >= 90) {
    feedback.push({
      type: 'success',
      message: 'Excellent form! Keep it up!',
      priority: 1,
    });
  } else if (score >= 70) {
    feedback.push({
      type: 'info',
      message: 'Good effort! Minor adjustments needed.',
      priority: 2,
    });
  } else if (score >= 50) {
    feedback.push({
      type: 'warning',
      message: 'Form needs improvement. Check your posture.',
      priority: 3,
    });
  } else {
    feedback.push({
      type: 'error',
      message: 'Poor form detected. Please review technique.',
      priority: 4,
    });
  }

  return feedback;
}

export default { generateFeedback };