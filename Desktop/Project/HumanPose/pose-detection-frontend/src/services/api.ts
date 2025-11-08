const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface AnalysisResult {
  status: string;
  data: {
    analysis_id?: string;
    landmarks: Array<{
      id: number;
      name: string;
      x: number;
      y: number;
      z: number;
      visibility: number;
    }>;
    connections: [number, number][];
    angles: Record<string, number>;
    score: {
      overall: number;
      breakdown: {
        posture: number;
        balance: number;
        form: number;
      };
    };
    feedback: Array<{
      type: 'success' | 'warning' | 'error';
      message: string;
      priority: number;
    }>;
    visualized_image?: string;
  };
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('exercise_type', 'squat');

  const response = await fetch(`${API_URL}/analyze/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to analyze image' }));
    throw new Error(error.detail || 'Failed to analyze image');
  }

  return response.json();
}

export async function analyzeVideo(file: File, exerciseType: string = 'general') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload/video?exercise_type=${exerciseType}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to upload video' }));
    throw new Error(error.detail || 'Failed to upload video');
  }

  return response.json();
}

export async function getVideoStatus(taskId: string) {
  const response = await fetch(`${API_URL}/upload/video/status/${taskId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get video status');
  }

  return response.json();
}

export async function getVideoResult(taskId: string) {
  const response = await fetch(`${API_URL}/upload/video/result/${taskId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get video result');
  }

  return response.json();
}

export async function getExercises() {
  const response = await fetch(`${API_URL}/exercises`);
  
  if (!response.ok) {
    throw new Error('Failed to get exercises');
  }

  return response.json();
}

export async function startSession(exerciseType: string) {
  const response = await fetch(`${API_URL}/sessions/start?exercise_type=${exerciseType}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to start session');
  }

  return response.json();
}

export async function endSession(sessionId: string) {
  const response = await fetch(`${API_URL}/sessions/${sessionId}/end`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to end session');
  }

  return response.json();
}