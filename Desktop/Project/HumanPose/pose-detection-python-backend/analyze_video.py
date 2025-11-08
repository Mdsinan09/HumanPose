from pathlib import Path
import sys
import cv2
from src.ml.pose_detector import pose_detector
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

def analyze_video(input_path: str, output_path: str):
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        logger.error(f"Cannot open video: {input_path}")
        raise SystemExit(1)

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # MediaPipe expects RGB
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose_detector.pose.process(img_rgb)
        if results.pose_landmarks:
            pose_detector.mp_drawing.draw_landmarks(frame, results.pose_landmarks, pose_detector.mp_pose.POSE_CONNECTIONS)
        out.write(frame)
        frame_idx += 1
        if frame_idx % 100 == 0:
            logger.info(f"Processed {frame_idx} frames")

    cap.release()
    out.release()
    logger.info(f"Saved annotated video to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python analyze_video.py /path/to/input.mp4 /path/to/output.mp4")
        sys.exit(1)
    analyze_video(sys.argv[1], sys.argv[2])
    cd /Users/mac/Desktop/Project/HumanPose/pose-detection-python-backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt || pip install fastapi uvicorn[standard] python-multipart aiofiles opencv-python mediapipe numpy python-dotenv pillow
    export PYTHONPATH="$(pwd):$PYTHONPATH"