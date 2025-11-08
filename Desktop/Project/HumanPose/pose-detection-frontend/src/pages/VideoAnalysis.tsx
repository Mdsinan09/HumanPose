import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import VideoResults from '../components/video/VideoResults';

export default function VideoAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('exercise_type', 'squat');

      const response = await axios.post(
        'http://localhost:8000/api/upload/video',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000 // 5 minutes timeout
        }
      );

      const sessionId = response.data.session_id;
      
      // Poll for results
      await pollForResults(sessionId);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze video. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const pollForResults = async (sessionId: string) => {
    const maxAttempts = 120; // 2 minutes max (1 second intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/sessions/${sessionId}`
        );

        const session = response.data;
        
        if (session.status === 'completed') {
          // Format result for VideoResults component
          setResult({
            frames: session.frames || [],
            score: session.score || { overall: 0, breakdown: {} },
            feedback: session.feedback || [],
            total_frames: session.total_frames || 0,
            duration: session.duration || 0
          });
          setIsAnalyzing(false);
        } else if (session.status === 'failed') {
          setError('Video analysis failed. Please try again.');
          setIsAnalyzing(false);
        } else {
          // Still processing, poll again
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 1000); // Poll every second
          } else {
            setError('Analysis is taking longer than expected. Please try again later.');
            setIsAnalyzing(false);
          }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setError('Failed to get analysis results. Please try again.');
          setIsAnalyzing(false);
        }
      }
    };

    // Start polling
    poll();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setError('');
  };

  if (result) {
    return <VideoResults result={result} onReset={handleReset} videoFile={selectedFile || undefined} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Video Analysis
        </h1>
        <p className="text-gray-400 text-lg">
          Upload a video of your exercise for detailed pose analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="glass rounded-2xl p-8">
        {!selectedFile ? (
          <div className="text-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 hover:border-blue-500 transition-colors">
                <ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-semibold mb-2">Click to upload video</p>
                <p className="text-gray-400">MP4, MOV, AVI up to 100MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                src={preview}
                controls
                className="w-full max-h-96 object-contain"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="btn-secondary disabled:opacity-50"
              >
                Change Video
              </button>
            </div>

            {isAnalyzing && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <span>Processing video frames... This may take a few minutes</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}