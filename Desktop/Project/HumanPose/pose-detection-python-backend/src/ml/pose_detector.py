import cv2
import mediapipe as mp
import ssl
import certifi
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class PoseDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # For static images - use model_complexity=1 to avoid download issues
        self.static_pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=1,  # Changed from 2 to 1 to use lighter model
            min_detection_confidence=0.5
        )
        
        # For video streams
        self.stream_pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        logger.info("PoseDetector initialized")

    def process_image(self, image):
        """Process a single image"""
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return self.static_pose.process(image_rgb)

    def process_frame(self, frame):
        """Process a video frame"""
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return self.stream_pose.process(frame_rgb)

    def get_landmarks_dict(self, landmarks):
        """Convert landmarks to dictionary"""
        if not landmarks:
            return {}
        
        landmark_names = [
            'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
            'right_eye_inner', 'right_eye', 'right_eye_outer',
            'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
            'left_index', 'right_index', 'left_thumb', 'right_thumb',
            'left_hip', 'right_hip', 'left_knee', 'right_knee',
            'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
            'left_foot_index', 'right_foot_index'
        ]
        
        result = {}
        for idx, landmark in enumerate(landmarks.landmark):
            if idx < len(landmark_names):
                result[landmark_names[idx]] = {
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                }
        return result

    def draw_landmarks(self, image, landmarks_dict):
        """Draw landmarks on image - requires mediapipe landmark object"""
        # Since we're receiving a dict, we need to convert it back or skip drawing
        # For now, return the original image
        # You can enhance this later to draw from the dictionary
        return image