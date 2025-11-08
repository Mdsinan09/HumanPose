import React from 'react';
import { Landmark } from '../../models/pose';

interface PoseRendererProps {
    landmarks: Landmark[];
}

const PoseRenderer: React.FC<PoseRendererProps> = ({ landmarks }) => {
    return (
        <div className="pose-renderer">
            {landmarks.map((landmark, index) => (
                <div
                    key={index}
                    className="landmark"
                    style={{
                        position: 'absolute',
                        left: landmark.x,
                        top: landmark.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="landmark-dot" />
                </div>
            ))}
        </div>
    );
};

export default PoseRenderer;