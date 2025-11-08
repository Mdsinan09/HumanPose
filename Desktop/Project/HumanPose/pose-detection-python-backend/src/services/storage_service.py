from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from src.config import settings
from src.models.session import Session
from pathlib import Path
import aiofiles
import uuid
from fastapi import UploadFile
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class StorageService:
    """
    Handle database operations with MongoDB and file storage
    """

    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.sessions_collection = None
        self.performances_collection = None

        self.uploads_dir = Path(settings.UPLOAD_DIR if hasattr(settings, "UPLOAD_DIR") else "uploads")
        self.images_dir = self.uploads_dir / "images"
        self.videos_dir = self.uploads_dir / "videos"
        self.results_dir = Path("results")

        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.videos_dir.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)

        logger.info("✅ StorageService initialized")

    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URI)
            self.db = self.client.get_default_database()
            self.sessions_collection = self.db.sessions
            self.performances_collection = self.db.performances

            # Test connection
            await self.client.admin.command("ping")

            logger.info("✅ Connected to MongoDB")
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("🔒 Disconnected from MongoDB")

    async def save_session(self, session: Session):
        """Save session to database"""
        try:
            session_dict = session.model_dump(by_alias=True, exclude={"id"})
            result = await self.sessions_collection.insert_one(session_dict)
            logger.info(f"💾 Session saved to DB: {session.session_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error saving session: {e}")
            return None

    async def save_performance(self, performance_data: dict):
        """Save exercise performance data"""
        try:
            performance_data["timestamp"] = datetime.utcnow()
            result = await self.performances_collection.insert_one(performance_data)
            logger.info(f"💾 Performance data saved")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error saving performance: {e}")
            return None

    async def get_user_sessions(self, user_id: str, limit: int = 10) -> List[dict]:
        """Get user's recent sessions"""
        try:
            cursor = (
                self.sessions_collection.find({"user_id": user_id})
                .sort("start_time", -1)
                .limit(limit)
            )
            sessions = await cursor.to_list(length=limit)
            return sessions
        except Exception as e:
            logger.error(f"Error fetching user sessions: {e}")
            return []

    async def get_user_stats(self, user_id: str) -> dict:
        """Get aggregated user statistics"""
        try:
            pipeline = [
                {"$match": {"user_id": user_id}},
                {
                    "$group": {
                        "_id": "$exercise_type",
                        "total_sessions": {"$sum": 1},
                        "total_frames": {"$sum": "$frame_count"},
                    }
                },
            ]

            cursor = self.sessions_collection.aggregate(pipeline)
            stats = await cursor.to_list(length=None)

            return {"user_id": user_id, "stats": stats}
        except Exception as e:
            logger.error(f"Error fetching user stats: {e}")
            return {"user_id": user_id, "stats": []}

    def save_file(self, file_content: bytes, filename: str, subfolder: str = "images") -> str:
        """
        Save file content (sync version).

        Args:
            file_content: bytes of the file
            filename: original filename (used to preserve extension)
            subfolder: 'images' or 'videos' (defaults to 'images')

        Returns:
            str: relative path like 'uploads/images/<uuid>.ext'
        """
        try:
            ext = Path(filename).suffix or ""
            unique_filename = f"{uuid.uuid4()}{ext}"

            if subfolder == "images":
                file_path = self.images_dir / unique_filename
            elif subfolder == "videos":
                file_path = self.videos_dir / unique_filename
            else:
                # fallback into uploads root/subfolder
                target_dir = self.uploads_dir / subfolder
                target_dir.mkdir(parents=True, exist_ok=True)
                file_path = target_dir / unique_filename

            with open(file_path, "wb") as f:
                f.write(file_content)

            relative = str(file_path)
            logger.info(f"✅ File saved: {relative}")
            return relative
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise

    async def save_file_async(self, file: UploadFile, file_type: str = "image") -> str:
        """
        Save uploaded file asynchronously (for UploadFile objects).

        Returns:
            str: saved file path as string
        """
        try:
            ext = Path(file.filename).suffix or ""
            unique_filename = f"{uuid.uuid4()}{ext}"

            if file_type in ("image", "images"):
                file_path = self.images_dir / unique_filename
            elif file_type in ("video", "videos"):
                file_path = self.videos_dir / unique_filename
            else:
                target_dir = self.uploads_dir / file_type
                target_dir.mkdir(parents=True, exist_ok=True)
                file_path = target_dir / unique_filename

            async with aiofiles.open(file_path, "wb") as out:
                content = await file.read()
                await out.write(content)

            logger.info(f"✅ Async file saved: {file_path}")
            return str(file_path)
        except Exception as e:
            logger.error(f"Failed to save async file: {e}")
            raise

    def save_result(self, data: bytes, filename: str) -> str:
        """Save analysis result and return path"""
        filepath = self.results_dir / filename
        with open(filepath, "wb") as f:
            f.write(data)
        logger.info(f"Saved result: {filepath}")
        return str(filepath)

    def get_file_path(self, filename: str, file_type: str = "image") -> Path:
        """Get file path"""
        if file_type == "image":
            return self.images_dir / filename
        if file_type == "video":
            return self.videos_dir / filename
        return self.uploads_dir / filename

    def delete_file(self, file_path: Path) -> bool:
        """Delete file"""
        try:
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file: {file_path}")
                return True
        except Exception as e:
            logger.error(f"Failed to delete file: {e}")
        return False

    def cleanup_old_files(self, hours: int = 24) -> int:
        """Delete files older than specified hours"""
        from datetime import datetime, timedelta

        cutoff = datetime.now() - timedelta(hours=hours)
        deleted_count = 0
        for directory in [self.uploads_dir, self.results_dir]:
            for filepath in directory.iterdir():
                if filepath.is_file():
                    file_time = datetime.fromtimestamp(filepath.stat().st_mtime)
                    if file_time < cutoff:
                        filepath.unlink()
                        deleted_count += 1

        logger.info(f"Cleaned up {deleted_count} old files")
        return deleted_count


# Global instance
storage_service = StorageService()