export interface Session {
    id: string;
    userId: string;
    exerciseType: string;
    startTime: Date;
    endTime?: Date;
    score: number;
    feedback: string;
    landmarks: Array<{ x: number; y: number; z: number }>;
}

export interface SessionState {
    currentSession: Session | null;
    isSessionActive: boolean;
    startSession: (userId: string, exerciseType: string) => void;
    endSession: () => void;
    updateScore: (score: number) => void;
    updateFeedback: (feedback: string) => void;
}