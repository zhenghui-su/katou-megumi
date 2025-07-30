import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Login from './pages/Management/Login';
import Dashboard from './pages/Management/Dashboard';
import Review from './pages/Management/Review';
import { AuthProvider } from './contexts/AuthContext';

function App() {
	return (
		<AuthProvider>
			<Routes>
			{/* 管理后台路由 - 不显示Header和Footer */}
			<Route path='/management' element={<Login />} />
			<Route path='/management/dashboard' element={<Dashboard />} />
			<Route path='/management/review' element={<Review />} />

			{/* 普通页面路由 - 显示Header和Footer */}
			<Route
				path='/*'
				element={
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
				}
			/>
			</Routes>
		</AuthProvider>
	);
}

export default App;
