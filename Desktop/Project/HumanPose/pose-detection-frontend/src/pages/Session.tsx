import { useEffect } from 'react';
import { useSession } from '../hooks/useSession';

export default function SessionPage() {
  const { sessionData, startSession, endSession } = useSession();

  useEffect(() => {
    if (!sessionData) {
      startSession('squat');
    }
  }, [sessionData, startSession]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Exercise Session</h1>
      <div className="glass rounded-2xl p-8">
        {sessionData ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{sessionData.exerciseType}</h2>
                <p className="text-gray-400">Session ID: {sessionData.sessionId}</p>
              </div>
              <button onClick={endSession} className="btn-danger">
                End Session
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold">{sessionData.averageScore.toFixed(1)}</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Total Scores</p>
                <p className="text-3xl font-bold">{sessionData.scores.length}</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-3xl font-bold">
                  {Math.floor((Date.now() - sessionData.startTime) / 1000)}s
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center">Loading session...</p>
        )}
      </div>
    </div>
  );
}