import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const rest: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function getExercise(exerciseId: string) {
  const response = await rest.get(`/exercises/${exerciseId}`);
  return response.data;
}

export async function getAllExercises() {
  const response = await rest.get('/exercises');
  return response.data;
}

export async function submitPoseData(poseData: unknown) {
  const response = await rest.post('/pose/submit', poseData);
  return response.data;
}

export async function getHistory(userId: string) {
  const response = await rest.get(`/history/${userId}`);
  return response.data;
}

export default rest;