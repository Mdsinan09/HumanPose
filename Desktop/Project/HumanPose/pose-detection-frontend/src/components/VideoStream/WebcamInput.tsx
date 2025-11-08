import React, { useEffect, useRef } from 'react';

const WebcamInput: React.FC<{ onVideoReady: (stream: MediaStream) => void }> = ({ onVideoReady }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    onVideoReady(stream);
                }
            } catch (error) {
                console.error('Error accessing webcam:', error);
            }
        };

        getUserMedia();

        return () => {
            if (videoRef.current) {
                const stream = videoRef.current.srcObject as MediaStream;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        };
    }, [onVideoReady]);

    return (
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto' }} />
    );
};

export default WebcamInput;