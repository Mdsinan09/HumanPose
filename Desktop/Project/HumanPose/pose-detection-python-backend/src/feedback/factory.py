from typing import Dict, Type
from src.feedback.base import FeedbackGenerator
from src.feedback.general import GeneralFeedback
from src.feedback.squat import SquatFeedback
from src.feedback.pushup import PushupFeedback
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class FeedbackFactory:
    """Factory for creating feedback generators"""
    
    _generators: Dict[str, Type[FeedbackGenerator]] = {
        'general': GeneralFeedback,
        'squat': SquatFeedback,
        'pushup': PushupFeedback,
        'plank': GeneralFeedback,  # Use general for now
        'deadlift': GeneralFeedback,  # Use general for now
    }
    
    @classmethod
    def get_feedback_generator(cls, exercise_type: str) -> FeedbackGenerator:
        """
        Get feedback generator for specific exercise type
        
        Args:
            exercise_type: Type of exercise
            
        Returns:
            Instance of FeedbackGenerator
        """
        exercise_type = exercise_type.lower()
        generator_class = cls._generators.get(exercise_type, cls._generators['general'])
        
        logger.info(f"Creating feedback generator for: {exercise_type}")
        return generator_class()
    
    @classmethod
    def register_generator(cls, exercise_type: str, generator_class: Type[FeedbackGenerator]):
        """Register a new feedback generator"""
        cls._generators[exercise_type] = generator_class
        logger.info(f"Registered feedback generator: {exercise_type}")
    
    @classmethod
    def get_supported_types(cls) -> list:
        """Get list of supported exercise types"""
        return list(cls._generators.keys())