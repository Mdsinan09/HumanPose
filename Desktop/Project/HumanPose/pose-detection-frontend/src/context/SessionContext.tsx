import { createContext, useState, ReactNode, useCallback, useContext } from 'react';
import { PoseData, SessionData } from '../types';

export interface SessionContextType {
  poseData: PoseData | null;
  sessionData: SessionData | null;
  setPoseData: (data: PoseData | null) => void;
  startSession: (exerciseType: string) => void;
  endSession: () => void;
  updateScore: (score: number) => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const startSession = useCallback((exerciseType: string) => {
    const newSession: SessionData = {
      sessionId: `session_${Date.now()}`,
      exerciseType,
      startTime: Date.now(),
      scores: [],
      averageScore: 0
    };
    setSessionData(newSession);
    setPoseData(null);
  }, []);

  const endSession = useCallback(() => {
    if (sessionData) {
      setSessionData({
        ...sessionData,
        endTime: Date.now()
      });
    }
    setPoseData(null);
  }, [sessionData]);

  const updateScore = useCallback((score: number) => {
    if (sessionData) {
      const newScores = [...sessionData.scores, score];
      const averageScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
      
      setSessionData({
        ...sessionData,
        scores: newScores,
        averageScore
      });
    }
  }, [sessionData]);

  return (
    <SessionContext.Provider 
      value={{ 
        poseData, 
        sessionData,
        setPoseData, 
        startSession, 
        endSession,
        updateScore
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Export the hook directly from this file
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};