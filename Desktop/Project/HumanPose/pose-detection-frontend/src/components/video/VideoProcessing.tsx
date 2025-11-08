import { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  status: string;
  taskId: string | null;
}

export default function VideoProcessing({ status, taskId }: Props) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl p-12">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-8 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-8 border-gray-700 rounded-full"></div>
          <div className="absolute inset-4 border-8 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin-slow"></div>
        </div>

        <h2 className="text-3xl font-bold mb-4">
          {status === 'uploading' ? 'Uploading Video' : 'Processing Video'}
          <span className="inline-block w-12 text-left">{dots}</span>
        </h2>

        <p className="text-gray-400 text-lg mb-6">
          {status === 'uploading' 
            ? 'Please wait while we upload your video...'
            : 'Analyzing frames and detecting poses...'}
        </p>

        {taskId && (
          <div className="glass-card p-4 inline-block">
            <p className="text-sm text-gray-500">Task ID:</p>
            <p className="text-xs text-gray-400 font-mono">{taskId}</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          <span>This may take 1-3 minutes depending on video length</span>
        </div>
      </div>
    </div>
  );
}