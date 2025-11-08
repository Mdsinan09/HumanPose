export interface Landmark {
  id?: number;
  name?: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
  confidence?: number;
}

export interface PoseAngles {
  left_knee: number;
  right_knee: number;
  left_hip: number;
  right_hip: number;
  left_shoulder: number;
  right_shoulder: number;
  left_elbow: number;
  right_elbow: number;
  back?: number;
}

export interface Score {
  overall: number;
  breakdown?: {
    posture?: number;
    balance?: number;
    form?: number;
  };
}

export interface Feedback {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  priority?: number;
}

export interface VideoFrame {
  frame_number: number;
  timestamp: number;
  landmarks: Landmark[];
  score: number;
  feedback: Feedback[];
}

export interface AnalysisResult {
  status: string;
  data: {
    landmarks: Landmark[];
    connections: [number, number][];
    angles: PoseAngles;
    score: Score;
    feedback: Feedback[];
    visualized_image?: string;
    frames?: VideoFrame[];
  };
}

export interface PoseData {
  landmarks: Landmark[];
  score: number;
  feedback: string[];
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  exerciseType: string;
  startTime: number;
  endTime?: number;
  scores: number[];
  averageScore: number;
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  error?: { message: string };
}

export interface ExerciseConfig {
  name: string;
  description: string;
  targetMuscles: string[];
}