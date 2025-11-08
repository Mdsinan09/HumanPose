from abc import ABC, abstractmethod
from typing import Dict, List, Any
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class FeedbackGenerator(ABC):
    """Base class for generating exercise feedback"""
    
    def __init__(self):
        self.feedback_messages: List[Dict[str, str]] = []
    
    @abstractmethod
    def generate_feedback(self, landmarks: Dict[str, Any], score: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate feedback based on landmarks and score
        
        Args:
            landmarks: Detected pose landmarks
            score: Score calculation result
            
        Returns:
            List of feedback messages with type and message
        """
        pass
    
    def add_feedback(self, feedback_type: str, message: str):
        """Add a feedback message"""
        self.feedback_messages.append({
            'type': feedback_type,  # 'success', 'warning', 'error'
            'message': message
        })
    
    def get_feedback(self) -> List[Dict[str, str]]:
        """Get all feedback messages"""
        return self.feedback_messages
    
    def clear_feedback(self):
        """Clear all feedback messages"""
        self.feedback_messages = []
    
    def calculate_angle(self, point1: Dict, point2: Dict, point3: Dict) -> float:
        """
        Calculate angle between three points
        
        Args:
            point1: First point {x, y, z}
            point2: Middle point {x, y, z}
            point3: Third point {x, y, z}
            
        Returns:
            Angle in degrees
        """
        import math
        
        # Vector from point2 to point1
        v1 = {
            'x': point1['x'] - point2['x'],
            'y': point1['y'] - point2['y']
        }
        
        # Vector from point2 to point3
        v2 = {
            'x': point3['x'] - point2['x'],
            'y': point3['y'] - point2['y']
        }
        
        # Calculate dot product and magnitudes
        dot_product = v1['x'] * v2['x'] + v1['y'] * v2['y']
        magnitude1 = math.sqrt(v1['x']**2 + v1['y']**2)
        magnitude2 = math.sqrt(v2['x']**2 + v2['y']**2)
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        # Calculate angle
        cos_angle = dot_product / (magnitude1 * magnitude2)
        cos_angle = max(-1.0, min(1.0, cos_angle))  # Clamp to [-1, 1]
        
        angle = math.acos(cos_angle)
        return math.degrees(angle)
    
    def get_distance(self, point1: Dict, point2: Dict) -> float:
        """
        Calculate distance between two points
        
        Args:
            point1: First point {x, y, z}
            point2: Second point {x, y, z}
            
        Returns:
            Distance
        """
        import math
        
        dx = point2['x'] - point1['x']
        dy = point2['y'] - point1['y']
        dz = point2.get('z', 0) - point1.get('z', 0)
        
        return math.sqrt(dx**2 + dy**2 + dz**2)