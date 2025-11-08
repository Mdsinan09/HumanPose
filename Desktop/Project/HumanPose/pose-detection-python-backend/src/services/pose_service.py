import cv2
from src.ml.pose_detector import PoseDetector
from src.ml.scoring_factory import ScoringFactory
from src.ml.landmark_processor import LandmarkProcessor
from src.models.pose import Keypoint
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class PoseService:
    def __init__(self):
        self.detector = PoseDetector()
        self.scorer_factory = ScoringFactory()
        self.landmark_processor = LandmarkProcessor()
        logger.info("✅ PoseService initialized")

    def _convert_landmarks_to_list(self, mediapipe_landmarks):
        """Convert MediaPipe landmarks to list of dicts for scorer"""
        landmarks_list = []
        for idx, landmark in enumerate(mediapipe_landmarks.landmark):
            landmarks_list.append({
                'id': idx,
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
        return landmarks_list

    def _calculate_angles(self, mediapipe_landmarks):
        """Calculate angles from landmarks"""
        # Convert to Keypoint list for angle calculation
        keypoints = []
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
        for idx, landmark in enumerate(mediapipe_landmarks.landmark):
            name = landmark_names[idx] if idx < len(landmark_names) else f'landmark_{idx}'
            keypoints.append(Keypoint(
                x=landmark.x,
                y=landmark.y,
                z=landmark.z,
                visibility=landmark.visibility,
                name=name
            ))
        
        # Calculate basic angles
        angles = {}
        try:
            # Knee angles
            if len(keypoints) > 27:
                left_knee_angle = LandmarkProcessor.calculate_angle(
                    keypoints[LandmarkProcessor.LEFT_HIP],
                    keypoints[LandmarkProcessor.LEFT_KNEE],
                    keypoints[LandmarkProcessor.LEFT_ANKLE]
                )
                right_knee_angle = LandmarkProcessor.calculate_angle(
                    keypoints[LandmarkProcessor.RIGHT_HIP],
                    keypoints[LandmarkProcessor.RIGHT_KNEE],
                    keypoints[LandmarkProcessor.RIGHT_ANKLE]
                )
                angles['left_knee'] = left_knee_angle
                angles['right_knee'] = right_knee_angle
            
            # Hip angles
            if len(keypoints) > 25:
                left_hip_angle = LandmarkProcessor.calculate_angle(
                    keypoints[LandmarkProcessor.LEFT_SHOULDER],
                    keypoints[LandmarkProcessor.LEFT_HIP],
                    keypoints[LandmarkProcessor.LEFT_KNEE]
                )
                right_hip_angle = LandmarkProcessor.calculate_angle(
                    keypoints[LandmarkProcessor.RIGHT_SHOULDER],
                    keypoints[LandmarkProcessor.RIGHT_HIP],
                    keypoints[LandmarkProcessor.RIGHT_KNEE]
                )
                angles['left_hip'] = left_hip_angle
                angles['right_hip'] = right_hip_angle
        except Exception as e:
            logger.warning(f"Error calculating angles: {e}")
        
        return angles

    def analyze_image(self, image, exercise_type: str):
        """Analyze a single image"""
        results = self.detector.process_image(image)
        if not results or not results.pose_landmarks:
            logger.warning("No pose detected in image")
            return None
        
        # Convert landmarks to format expected by scorer
        landmarks_list = self._convert_landmarks_to_list(results.pose_landmarks)
        angles = self._calculate_angles(results.pose_landmarks)
        
        # Get scorer and calculate score/feedback
        scorer = self.scorer_factory.get_scorer(exercise_type)
        score = scorer.calculate_score(landmarks_list, angles)
        feedback = scorer.generate_feedback(landmarks_list, angles, score)
        
        landmarks_dict = self.detector.get_landmarks_dict(results.pose_landmarks)
        
        return {
            "landmarks": landmarks_dict,
            "score": score,
            "feedback": feedback
        }

    def analyze_frame(self, frame, exercise_type: str):
        """Analyze a video frame"""
        results = self.detector.process_frame(frame)
        
        if not results or not results.pose_landmarks:
            return None
        
        # Convert landmarks to format expected by scorer
        landmarks_list = self._convert_landmarks_to_list(results.pose_landmarks)
        angles = self._calculate_angles(results.pose_landmarks)
        
        # Get scorer and calculate score/feedback
        scorer = self.scorer_factory.get_scorer(exercise_type)
        score = scorer.calculate_score(landmarks_list, angles)
        feedback = scorer.generate_feedback(landmarks_list, angles, score)
        
        # Get landmarks dict for frontend AR overlay
        landmarks_dict = self.detector.get_landmarks_dict(results.pose_landmarks)
        
        return {
            "landmarks": landmarks_dict,
            "score": score,
            "feedback": feedback
        }