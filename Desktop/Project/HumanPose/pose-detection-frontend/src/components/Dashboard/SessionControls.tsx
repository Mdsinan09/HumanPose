import React from 'react';

const SessionControls: React.FC<{ onStart: () => void; onStop: () => void; isActive: boolean }> = ({ onStart, onStop, isActive }) => {
    return (
        <div className="session-controls">
            <button onClick={onStart} disabled={isActive}>
                Start Session
            </button>
            <button onClick={onStop} disabled={!isActive}>
                Stop Session
            </button>
        </div>
    );
};

export default SessionControls;