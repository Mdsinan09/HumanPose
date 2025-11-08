import { useState, useCallback } from 'react';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Props {
  onFileSelect: (file: File) => void;
}

export default function ImageUploader({ onFileSelect }: Props) {
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
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please upload an image file (JPG, PNG, WEBP)');
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
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <PhotoIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
        
        <h3 className="text-2xl font-bold mb-2">Upload Image</h3>
        <p className="text-gray-400 mb-6">
          Drag and drop your image here, or click to browse
        </p>
        
        <label
          htmlFor="file-upload"
          className="btn-primary cursor-pointer inline-flex items-center"
        >
          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
          Choose Image
        </label>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports: JPG, PNG, WEBP (Max 10MB)
        </p>
      </div>
    </div>
  );
}