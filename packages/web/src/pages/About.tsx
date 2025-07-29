import React from 'react';
import { Box, Typography, Container, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const About: React.FC = () => {
	const characteristics = [
		'温柔',
		'善良',
		'理解力强',
		'支持他人',
		'平凡中的不平凡',
		'真诚',
		'可靠',
		'体贴',
	];

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<Typography variant='h2' component='h1' align='center' sx={{ mb: 2 }}>
					关于加藤惠
				</Typography>
				<Typography
					variant='h6'
					align='center'
					color='text.secondary'
					sx={{ mb: 6 }}
				>
					路人女主的养成方法中的女主角
				</Typography>
			</motion.div>

			<Grid container spacing={4}>
				<Grid component={motion.div}>
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<Paper elevation={3} sx={{ p: 4, height: '100%' }}>
							<Typography
								variant='h4'
								component='h2'
								sx={{ mb: 3, color: 'primary.main' }}
							>
								基本信息
							</Typography>
							<Box sx={{ mb: 3 }}>
								<Typography variant='h6' sx={{ mb: 1 }}>
									姓名
								</Typography>
								<Typography variant='body1' sx={{ mb: 2 }}>
									加藤惠（かとう めぐみ）
								</Typography>

								<Typography variant='h6' sx={{ mb: 1 }}>
									作品
								</Typography>
								<Typography variant='body1' sx={{ mb: 2 }}>
									路人女主的养成方法
								</Typography>

								<Typography variant='h6' sx={{ mb: 1 }}>
									声优
								</Typography>
								<Typography variant='body1' sx={{ mb: 2 }}>
									安野希世乃
								</Typography>

								<Typography variant='h6' sx={{ mb: 1 }}>
									年级
								</Typography>
								<Typography variant='body1'>高中二年级</Typography>
							</Box>
						</Paper>
					</motion.div>
				</Grid>

				<Grid component={motion.div}>
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<Paper elevation={3} sx={{ p: 4, height: '100%' }}>
							<Typography
								variant='h4'
								component='h2'
								sx={{ mb: 3, color: 'primary.main' }}
							>
								性格特点
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
								{characteristics.map((trait, index) => (
									<motion.div
										key={trait}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
									>
										<Chip
											label={trait}
											color='primary'
											variant='outlined'
											sx={{ mb: 1 }}
										/>
									</motion.div>
								))}
							</Box>
						</Paper>
					</motion.div>
				</Grid>

				<Grid component={motion.div}>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						<Paper elevation={3} sx={{ p: 4 }}>
							<Typography
								variant='h4'
								component='h2'
								sx={{ mb: 3, color: 'primary.main' }}
							>
								角色介绍
							</Typography>
							<Typography variant='body1' sx={{ lineHeight: 1.8, mb: 2 }}>
								加藤惠是《路人女主的养成方法》中的女主角，是一个看似平凡却充满魅力的女孩。
								她拥有着独特的"路人"属性，能够在人群中完美地隐藏自己的存在感，但正是这种平凡中蕴含着不平凡的魅力。
							</Typography>
							<Typography variant='body1' sx={{ lineHeight: 1.8, mb: 2 }}>
								惠的性格温和善良，总是能够理解他人的想法，并给予适当的支持和鼓励。
								她虽然看起来平淡无奇，但实际上拥有着敏锐的洞察力和坚强的内心。
								在与安艺伦也等人的相处中，她逐渐展现出了自己独特的魅力和重要性。
							</Typography>
							<Typography variant='body1' sx={{ lineHeight: 1.8 }}>
								加藤惠代表着一种真实而朴素的美好，她不需要华丽的外表或特殊的才能，
								仅仅是她的存在本身就足以温暖人心，成为他人生活中不可或缺的重要存在。
							</Typography>
						</Paper>
					</motion.div>
				</Grid>
			</Grid>
		</Container>
	);
};

export default About;
