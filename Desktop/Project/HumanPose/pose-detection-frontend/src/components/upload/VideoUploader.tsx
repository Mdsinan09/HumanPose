import React, { useState, useCallback } from 'react';
import { ArrowUpTrayIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface Props {
  onFileSelect: (file: File) => void;
}

export default function VideoUploader({ onFileSelect }: Props) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert('Please upload a video file (MP4, MOV, AVI)');
      }
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="glass rounded-2xl p-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="video-upload"
          accept="video/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <VideoCameraIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
        
        <h3 className="text-2xl font-bold mb-2">Upload Video</h3>
        <p className="text-gray-400 mb-6">
          Drag and drop your workout video here, or click to browse
        </p>
        
        <label
          htmlFor="video-upload"
          className="btn-primary cursor-pointer inline-flex items-center"
        >
          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
          Choose Video
        </label>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports: MP4, MOV, AVI (Max 100MB, 2 minutes)
        </p>
      </div>
    </div>
  );
}