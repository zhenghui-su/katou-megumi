import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import { AuthProvider } from './contexts/AuthContext';

function App() {
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
				<Box component='main' sx={{ flexGrow: 1 }}>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/gallery' element={<Gallery />} />
						<Route path='/about' element={<About />} />
					</Routes>
				</Box>
				<Footer />
			</Box>
		</AuthProvider>
	);
}

export default App;
