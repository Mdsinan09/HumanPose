from typing import Optional, Dict
from src.scoring.base import BaseScoring
from src.scoring.squat import SquatScoring
from src.utils.logger import logger


class ScoringFactory:
    """
    Factory for creating exercise-specific scoring modules
    """
    
    _scoring_modules: Dict[str, BaseScoring] = {
        'squat': SquatScoring()
    }
    
    @classmethod
    def get_scoring(cls, exercise_type: str) -> Optional[BaseScoring]:
        """
        Get scoring module for specific exercise
        
        Args:
            exercise_type: Type of exercise (e.g., 'squat', 'pushup')
            
        Returns:
            Scoring module or None if not found
        """
        exercise_type = exercise_type.lower().strip()
        
        if exercise_type not in cls._scoring_modules:
            logger.warning(f"No scoring module found for exercise: {exercise_type}")
            return None
        
        return cls._scoring_modules[exercise_type]
    
    @classmethod
    def register_scoring(cls, exercise_type: str, scoring_module: BaseScoring) -> None:
        """Register a new scoring module"""
        cls._scoring_modules[exercise_type.lower()] = scoring_module
        logger.info(f"✅ Registered scoring module for: {exercise_type}")
    
    @classmethod
    def get_supported_exercises(cls) -> list:
        """Get list of supported exercises"""
        return list(cls._scoring_modules.keys())