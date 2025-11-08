import React from 'react';
import { Score } from '../../types';

interface Props {
  score: Score;
}

export default function ScoreCard({ score }: Props) {
  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (value: number) => {
    if (value >= 90) return 'A';
    if (value >= 80) return 'B';
    if (value >= 70) return 'C';
    if (value >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 border border-blue-500 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Pose Score</h2>
      
      <div className="text-center mb-8">
        <div className={`text-7xl font-bold ${getScoreColor(score.overall)}`}>
          {score.overall}
        </div>
        <div className="text-3xl font-bold text-white/80 mt-2">
          Grade: {getScoreGrade(score.overall)}
        </div>
      </div>

      {score.breakdown && (
        <div className="grid grid-cols-3 gap-4">
          <ScoreItem label="Posture" value={score.breakdown.posture || 0} />
          <ScoreItem label="Balance" value={score.breakdown.balance || 0} />
          <ScoreItem label="Form" value={score.breakdown.form || 0} />
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
    </div>
  );
}