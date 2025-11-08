import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import LiveCamera from './pages/LiveCamera';
import VideoAnalysis from './pages/VideoAnalysis';
import ImageAnalysis from './pages/ImageAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="live" element={<LiveCamera />} />
          <Route path="video" element={<VideoAnalysis />} />
          <Route path="image" element={<ImageAnalysis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
