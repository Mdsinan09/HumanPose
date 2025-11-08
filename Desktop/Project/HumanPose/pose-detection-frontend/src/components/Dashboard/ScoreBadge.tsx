import React from 'react';

interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    const getBadgeColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className={`p-4 rounded-lg text-white ${getBadgeColor(score)}`}>
            <h2 className="text-xl font-bold">Form Correctness Score</h2>
            <p className="text-2xl">{score}%</p>
        </div>
    );
};

export default ScoreBadge;