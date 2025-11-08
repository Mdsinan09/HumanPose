import base64
from typing import Optional


def decode_base64_image(base64_string: str) -> Optional[bytes]:
    """
    Decode base64 image string to bytes
    
    Args:
        base64_string: Base64 encoded image (with or without data URL prefix)
        
    Returns:
        Image bytes or None if decoding fails
    """
    try:
        # Remove data URL prefix if present
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
        
        return base64.b64decode(base64_string)
    except Exception:
        return None


def encode_image_to_base64(image_bytes: bytes) -> str:
    """
    Encode image bytes to base64 string
    
    Args:
        image_bytes: Image bytes
        
    Returns:
        Base64 encoded string
    """
    return base64.b64encode(image_bytes).decode('utf-8')


def validate_exercise_type(exercise_type: str, supported_exercises: list) -> bool:
    """
    Validate if exercise type is supported
    
    Args:
        exercise_type: Exercise type to validate
        supported_exercises: List of supported exercise types
        
    Returns:
        True if valid, False otherwise
    """
    return exercise_type.lower().strip() in [ex.lower() for ex in supported_exercises]