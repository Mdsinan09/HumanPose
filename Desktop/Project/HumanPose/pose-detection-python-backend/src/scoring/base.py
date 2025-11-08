from abc import ABC, abstractmethod
from typing import List
from src.models.pose import Pose, PoseAngles, ScoreResult


class BaseScoring(ABC):
    """
    Abstract base class for exercise scoring
    """
    
    def __init__(self):
        self.min_score = 0
        self.max_score = 100
    
    @abstractmethod
    def calculate_score(self, pose: Pose, angles: PoseAngles) -> ScoreResult:
        """Calculate form score for the exercise"""
        pass
    
    @abstractmethod
    def get_exercise_name(self) -> str:
        """Return exercise name"""
        pass
    
    def normalize_score(self, score: float) -> int:
        """Normalize score to 0-100 range"""
        return max(self.min_score, min(self.max_score, int(score)))
    
    def calculate_metric_score(
        self,
        value: float,
        ideal: float,
        tolerance: float
    ) -> float:
        """
        Calculate score for a specific metric
        
        Args:
            value: Current measured value
            ideal: Ideal target value
            tolerance: Acceptable deviation from ideal
            
        Returns:
            Score from 0-100
        """
        deviation = abs(value - ideal)
        
        if deviation <= tolerance:
            return 100.0
        
        # Linear penalty beyond tolerance
        score = 100.0 - ((deviation - tolerance) / tolerance) * 50.0
        return max(0.0, min(100.0, score))
    
    def is_angle_in_range(self, angle: float, min_angle: float, max_angle: float) -> bool:
        """Check if angle is within acceptable range"""
        return min_angle <= angle <= max_angle
    
    def weighted_average(self, scores: List[float], weights: List[float]) -> float:
        """Calculate weighted average of scores"""
        if len(scores) != len(weights):
            raise ValueError("Scores and weights must have same length")
        
        if sum(weights) == 0:
            raise ValueError("Sum of weights cannot be zero")
        
        weighted_sum = sum(s * w for s, w in zip(scores, weights))
        return weighted_sum / sum(weights)