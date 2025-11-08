import React from 'react';

interface FeedbackPanelProps {
    feedback: string;
    score: number;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, score }) => {
    return (
        <div className="feedback-panel">
            <h2>Feedback</h2>
            <p>{feedback}</p>
            <h3>Form Correctness Score: {score}/100</h3>
        </div>
    );
};

export default FeedbackPanel;