import { useState, useEffect } from 'react';
import { ClockIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface HistoryItem {
  id: string;
  type: 'image' | 'video' | 'live';
  timestamp: number;
  score: number;
  thumbnail?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'live'>('all');

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('poseHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('poseHistory', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('poseHistory');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '📸';
      case 'video': return '🎥';
      case 'live': return '📹';
      default: return '📊';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <ClockIcon className="w-10 h-10 text-yellow-500" />
            Analysis History
          </h1>
          <p className="text-gray-400 text-lg">
            View and manage your past pose analyses
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass rounded-2xl p-2 mb-8 flex gap-2">
        {(['all', 'image', 'video', 'live'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === type
                ? 'bg-blue-500 text-white'
                : 'hover:bg-white/10 text-gray-400'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4 opacity-30">📭</div>
          <h2 className="text-2xl font-bold mb-2">No History Yet</h2>
          <p className="text-gray-400 mb-6">
            Your pose analysis history will appear here
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/image" className="btn-primary">
              Analyze Image
            </a>
            <a href="/video" className="btn-secondary">
              Analyze Video
            </a>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt="Analysis thumbnail"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-6xl">{getTypeIcon(item.type)}</span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">
                    {formatDate(item.timestamp)}
                  </span>
                  <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <span className="text-xl">{getTypeIcon(item.type)}</span>
                  <span className="capitalize">{item.type} Analysis</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {history.length > 0 && (
        <div className="glass rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{history.length}</p>
              <p className="text-sm text-gray-400">Total Analyses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length)}
              </p>
              <p className="text-sm text-gray-400">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-500">
                {history.filter(item => item.type === 'image').length}
              </p>
              <p className="text-sm text-gray-400">Images</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {history.filter(item => item.type === 'video').length}
              </p>
              <p className="text-sm text-gray-400">Videos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}