import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, VideoCameraIcon, PhotoIcon, ClockIcon, Cog6ToothIcon, CameraIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/live', label: 'Live Camera', icon: CameraIcon },
    { path: '/video', label: 'Video', icon: VideoCameraIcon },
    { path: '/image', label: 'Image', icon: PhotoIcon },
    { path: '/chatbot', label: 'Chatbot', icon: ChatBubbleLeftRightIcon },
    { path: '/history', label: 'History', icon: ClockIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <nav className="glass border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏋️</span>
            <span className="text-xl font-bold">HumanPose AI</span>
          </div>

          <div className="flex gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}