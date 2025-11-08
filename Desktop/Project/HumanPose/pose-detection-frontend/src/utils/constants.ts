export const WEBSOCKET_URL = 'ws://localhost:4000'; // Replace with your backend WebSocket URL
export const POSE_ESTIMATION_MODEL = 'lightweight_model'; // Specify the pose estimation model to use
export const EXERCISES = {
    SQUAT: 'squat',
    LUNGE: 'lunge',
    PUSH_UP: 'push_up',
    // Add more exercises as needed
};
export const FEEDBACK_MESSAGES = {
    SQUAT: {
        CORRECT: 'Great job! Your squat form looks good.',
        INCORRECT: 'Keep your back straight and knees aligned with your toes.',
    },
    LUNGE: {
        CORRECT: 'Nice lunge! Keep it up.',
        INCORRECT: 'Make sure your front knee doesn’t go past your toes.',
    },
    // Add more feedback messages for other exercises
};
export const SCORE_THRESHOLD = {
    EXCELLENT: 90,
    GOOD: 75,
    AVERAGE: 50,
    POOR: 0,
};

export const LANDMARK_NAMES = [
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

export const EXERCISE_TYPES = {
  SQUAT: 'squat',
  PUSHUP: 'pushup',
  PLANK: 'plank',
  LUNGE: 'lunge',
} as const;

export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  FAIR: 50,
  POOR: 0,
} as const;

export default {
  LANDMARK_NAMES,
  EXERCISE_TYPES,
  SCORE_THRESHOLDS,
};