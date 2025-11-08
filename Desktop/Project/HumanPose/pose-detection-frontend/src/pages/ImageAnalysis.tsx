import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ImageProcessing from '../components/image/ImageProcessing';

export default function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
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
        'http://localhost:8000/api/analyze/image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      // Handle response structure
      const data = response.data.data || response.data;
      setResult({
        score: data.score || response.data.score,
        feedback: data.feedback || response.data.feedback,
        annotated_image: data.visualized_image || data.annotated_image || response.data.annotated_image
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setError('');
  };

  if (isAnalyzing) {
    return <ImageProcessing />;
  }

  if (result) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Image Analysis Results</h2>
              <button onClick={handleReset} className="btn-secondary">
                Analyze Another
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Original Image */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Original Image</h3>
                <div className="rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={preview}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Annotated Image with Pose */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Pose Detection</h3>
                <div className="rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={result.annotated_image}
                    alt="Analyzed"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Score Section */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-card p-6 text-center col-span-1">
                <div className="text-5xl font-bold mb-2" style={{
                  color: result.score?.overall >= 80 ? '#10B981' : 
                         result.score?.overall >= 60 ? '#F59E0B' : '#EF4444'
                }}>
                  {result.score?.overall || 0}
                </div>
                <p className="text-gray-400">Overall Score</p>
              </div>

              <div className="glass-card p-4 col-span-3">
                <h3 className="font-bold mb-3">Score Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(result.score?.breakdown || {}).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-300">{key}</span>
                        <span className="font-bold">{value}/100</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {result.feedback && result.feedback.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Feedback & Recommendations</h3>
              <div className="space-y-3">
                {result.feedback.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      item.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : item.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <span className="text-2xl">
                      {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : '❌'}
                    </span>
                    <p className="flex-1 text-gray-200">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Image Analysis
        </h1>
        <p className="text-gray-400 text-lg">
          Upload an image of your exercise pose for instant analysis
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
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 hover:border-blue-500 transition-colors">
                <ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-semibold mb-2">Click to upload image</p>
                <p className="text-gray-400">JPG, PNG up to 10MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-96 object-contain mx-auto"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
              </button>

              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="btn-secondary disabled:opacity-50"
              >
                Change Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}