import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import UploadDemo from './pages/UploadDemo';
import Login from './pages/Management/Login';
import Dashboard from './pages/Management/Dashboard';

function App() {
	return (
		<Routes>
			{/* 管理后台路由 - 不显示Header和Footer */}
			<Route path='/management' element={<Login />} />
			<Route path='/management/dashboard' element={<Dashboard />} />

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
								<Route path='/upload' element={<UploadDemo />} />
							</Routes>
						</Box>
						<Footer />
					</Box>
				}
			/>
		</Routes>
	);
}

export default App;
