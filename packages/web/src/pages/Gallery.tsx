import React from 'react';
import {
	Box,
	Typography,
	Container,
	Grid,
	Card,
	CardMedia,
	CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';

const Gallery: React.FC = () => {
	// 占位图片数据，用户可以后续替换
	const images = [
		{
			id: 1,
			title: '加藤惠 - 日常',
			description: '加藤惠的日常生活照片',
			src: 'https://via.placeholder.com/400x300/ff6b9d/ffffff?text=加藤惠+1',
		},
		{
			id: 2,
			title: '加藤惠 - 校园',
			description: '在学校的加藤惠',
			src: 'https://via.placeholder.com/400x300/4fc3f7/ffffff?text=加藤惠+2',
		},
		{
			id: 3,
			title: '加藤惠 - 制服',
			description: '穿着校服的加藤惠',
			src: 'https://via.placeholder.com/400x300/ff6b9d/ffffff?text=加藤惠+3',
		},
		{
			id: 4,
			title: '加藤惠 - 便装',
			description: '便装打扮的加藤惠',
			src: 'https://via.placeholder.com/400x300/4fc3f7/ffffff?text=加藤惠+4',
		},
		{
			id: 5,
			title: '加藤惠 - 微笑',
			description: '加藤惠的温柔微笑',
			src: 'https://via.placeholder.com/400x300/ff6b9d/ffffff?text=加藤惠+5',
		},
		{
			id: 6,
			title: '加藤惠 - 思考',
			description: '思考中的加藤惠',
			src: 'https://via.placeholder.com/400x300/4fc3f7/ffffff?text=加藤惠+6',
		},
	];

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<Typography variant='h2' component='h1' align='center' sx={{ mb: 2 }}>
					加藤惠画廊
				</Typography>
				<Typography
					variant='h6'
					align='center'
					color='text.secondary'
					sx={{ mb: 6 }}
				>
					收录加藤惠的精美图片集合
				</Typography>
			</motion.div>

			<Grid container spacing={3}>
				{images.map((image, index) => (
					<Grid component={motion.div} key={image.id}>
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: index * 0.1 }}
						>
							<Card
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									transition:
										'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
									},
								}}
							>
								<CardMedia
									component='img'
									height='250'
									image={image.src}
									alt={image.title}
									sx={{
										objectFit: 'cover',
									}}
								/>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography variant='h6' component='h3' sx={{ mb: 1 }}>
										{image.title}
									</Typography>
									<Typography variant='body2' color='text.secondary'>
										{image.description}
									</Typography>
								</CardContent>
							</Card>
						</motion.div>
					</Grid>
				))}
			</Grid>

			<Box sx={{ mt: 6, textAlign: 'center' }}>
				<Typography variant='body1' color='text.secondary'>
					更多精美图片正在整理中，敬请期待...
				</Typography>
			</Box>
		</Container>
	);
};

export default Gallery;
