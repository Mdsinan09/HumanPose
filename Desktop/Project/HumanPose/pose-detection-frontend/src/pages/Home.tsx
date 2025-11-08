import React from 'react';
import { Link } from 'react-router-dom';
import { PhotoIcon, VideoCameraIcon, CameraIcon, ClockIcon } from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      icon: PhotoIcon,
      title: 'Image Analysis',
      description: 'Upload a photo to analyze pose and form',
      link: '/image',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: VideoCameraIcon,
      title: 'Video Analysis',
      description: 'Upload workout videos for detailed analysis',
      link: '/video',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: CameraIcon,
      title: 'Live Camera',
      description: 'Real-time pose detection with instant feedback',
      link: '/live',
      color: 'from-green-600 to-emerald-600',
    },
    {
      icon: ClockIcon,
      title: 'History',
      description: 'View your past sessions and track progress',
      link: '/history',
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Pose Detection
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Get real-time feedback on your exercise form using advanced computer vision.
          Perfect your technique and prevent injuries.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.link}
            to={feature.link}
            className="glass rounded-2xl p-6 hover:scale-105 transition-transform group"
          >
            <div className={`w-12 h-12 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:bg-${feature.color}-500/30 transition-colors`}>
              <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="text-center glass rounded-2xl p-6">
          <div className="text-4xl font-bold text-blue-500 mb-2">33</div>
          <div className="text-gray-400">Body Landmarks</div>
        </div>
        <div className="text-center glass rounded-2xl p-6">
          <div className="text-4xl font-bold text-purple-500 mb-2">Real-time</div>
          <div className="text-gray-400">Feedback</div>
        </div>
        <div className="text-center glass rounded-2xl p-6">
          <div className="text-4xl font-bold text-green-500 mb-2">95%+</div>
          <div className="text-gray-400">Accuracy</div>
        </div>
      </div>

      {/* Chatbot Link */}
      <div className="mt-8 text-center">
        
      </div>
    </div>
  );
};

export default Home;