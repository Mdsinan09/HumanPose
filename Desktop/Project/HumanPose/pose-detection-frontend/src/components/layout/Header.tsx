import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PhotoIcon, VideoCameraIcon, CameraIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/image', label: 'Image', icon: PhotoIcon },
    { path: '/video', label: 'Video', icon: VideoCameraIcon },
    { path: '/live', label: 'Live', icon: CameraIcon },
    { path: '/history', label: 'History', icon: ClockIcon },
  ];
  
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform glow-pulse">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Pose AI</h1>
              <p className="text-xs text-gray-400">Advanced Motion Analysis</p>
            </div>
          </Link>
          
          <nav className="flex gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg neon-blue'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{label}</span>
                {isActive(path) && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl"></div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}