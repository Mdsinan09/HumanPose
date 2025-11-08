import React from 'react';

interface LandmarkTooltipProps {
    landmarkName: string;
    position: { x: number; y: number };
}

const LandmarkTooltip: React.FC<LandmarkTooltipProps> = ({ landmarkName, position }) => {
    return (
        <div style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px',
            borderRadius: '4px',
            pointerEvents: 'none',
        }}>
            {landmarkName}
        </div>
    );
};

export default LandmarkTooltip;