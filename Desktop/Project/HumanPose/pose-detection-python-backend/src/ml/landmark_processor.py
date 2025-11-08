import math
from typing import List, Tuple
from src.models.pose import Keypoint, PoseAngles


class LandmarkProcessor:
    """
    Process 33 MediaPipe landmarks to calculate angles and metrics
    """
    
    # MediaPipe landmark indices
    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    LEFT_HEEL = 29
    RIGHT_HEEL = 30
    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32
    
    @staticmethod
    def calculate_angle(a: Keypoint, b: Keypoint, c: Keypoint) -> float:
        """
        Calculate angle between three points (in degrees)
        
        Args:
            a: First point
            b: Vertex point
            c: Third point
            
        Returns:
            Angle in degrees (0-180)
        """
        # Calculate vectors
        ba = (a.x - b.x, a.y - b.y)
        bc = (c.x - b.x, c.y - b.y)
        
        # Calculate angle using dot product
        dot_product = ba[0] * bc[0] + ba[1] * bc[1]
        
        # Calculate magnitudes
        magnitude_ba = math.sqrt(ba[0]**2 + ba[1]**2)
        magnitude_bc = math.sqrt(bc[0]**2 + bc[1]**2)
        
        # Avoid division by zero
        if magnitude_ba == 0 or magnitude_bc == 0:
            return 0.0
        
        # Calculate angle
        cos_angle = dot_product / (magnitude_ba * magnitude_bc)
        cos_angle = max(-1.0, min(1.0, cos_angle))  # Clamp to [-1, 1]
        
        angle = math.acos(cos_angle)
        angle_degrees = math.degrees(angle)
        
        return angle_degrees
    
    @classmethod
    def extract_squat_angles(cls, keypoints: List[Keypoint]) -> PoseAngles:
        """
        Extract angles relevant for squat analysis
        """
        left_hip = keypoints[cls.LEFT_HIP]
        right_hip = keypoints[cls.RIGHT_HIP]
        left_knee = keypoints[cls.LEFT_KNEE]
        right_knee = keypoints[cls.RIGHT_KNEE]
        left_ankle = keypoints[cls.LEFT_ANKLE]
        right_ankle = keypoints[cls.RIGHT_ANKLE]
        left_shoulder = keypoints[cls.LEFT_SHOULDER]
        right_shoulder = keypoints[cls.RIGHT_SHOULDER]
        
        return PoseAngles(
            left_knee=cls.calculate_angle(left_hip, left_knee, left_ankle),
            right_knee=cls.calculate_angle(right_hip, right_knee, right_ankle),
            left_hip=cls.calculate_angle(left_shoulder, left_hip, left_knee),
            right_hip=cls.calculate_angle(right_shoulder, right_hip, right_knee),
            back=cls.calculate_back_angle(keypoints)
        )
    
    @classmethod
    def calculate_back_angle(cls, keypoints: List[Keypoint]) -> float:
        """
        Calculate back angle (spine alignment from vertical)
        0 degrees = perfectly vertical
        """
        left_shoulder = keypoints[cls.LEFT_SHOULDER]
        right_shoulder = keypoints[cls.RIGHT_SHOULDER]
        left_hip = keypoints[cls.LEFT_HIP]
        right_hip = keypoints[cls.RIGHT_HIP]
        
        # Average shoulder and hip points
        shoulder_mid_x = (left_shoulder.x + right_shoulder.x) / 2
        shoulder_mid_y = (left_shoulder.y + right_shoulder.y) / 2
        
        hip_mid_x = (left_hip.x + right_hip.x) / 2
        hip_mid_y = (left_hip.y + right_hip.y) / 2
        
        # Calculate angle from vertical (y-axis)
        dx = shoulder_mid_x - hip_mid_x
        dy = shoulder_mid_y - hip_mid_y
        
        if dy == 0:
            return 90.0  # Horizontal
        
        angle = abs(math.degrees(math.atan(dx / dy)))
        return angle
    
    @staticmethod
    def get_distance(a: Keypoint, b: Keypoint) -> float:
        """Calculate Euclidean distance between two keypoints"""
        return math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2 + (b.z - a.z)**2)
    
    @staticmethod
    def is_keypoint_visible(keypoint: Keypoint, threshold: float = 0.5) -> bool:
        """Check if keypoint is visible above threshold"""
        return keypoint.visibility >= threshold
    
    @classmethod
    def check_pose_stability(
        cls,
        current_keypoints: List[Keypoint],
        previous_keypoints: List[Keypoint],
        threshold: float = 0.05
    ) -> bool:
        """
        Check if pose is stable (minimal movement between frames)
        """
        if len(current_keypoints) != len(previous_keypoints):
            return False
        
        total_movement = 0.0
        for curr, prev in zip(current_keypoints, previous_keypoints):
            total_movement += cls.get_distance(curr, prev)
        
        avg_movement = total_movement / len(current_keypoints)
        return avg_movement < threshold
    
    @classmethod
    def get_body_center(cls, keypoints: List[Keypoint]) -> Tuple[float, float]:
        """Get the center point of the body (average of hips)"""
        left_hip = keypoints[cls.LEFT_HIP]
        right_hip = keypoints[cls.RIGHT_HIP]
        
        center_x = (left_hip.x + right_hip.x) / 2
        center_y = (left_hip.y + right_hip.y) / 2
        
        return center_x, center_y