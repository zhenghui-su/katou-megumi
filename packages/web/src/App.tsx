import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import { AuthProvider } from './contexts/AuthContext';
import { MusicPlayer, Track } from '@katou-megumi/shared';
import musicService from './services/musicService';

function App() {
  const [tracks, setTracks] = useState<Track[]>([]);

  // 获取音乐列表
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const musicList = await musicService.getAllMusic();
        setTracks(musicList);
      } catch (error) {
        console.error('Failed to fetch music:', error);
      }
    };

    fetchMusic();
  }, []);

  return (
    <AuthProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Box>
        <Footer />
        {/* 全局音乐播放器 */}
        <MusicPlayer tracks={tracks} />
      </Box>
    </AuthProvider>
  );
}

export default App;
