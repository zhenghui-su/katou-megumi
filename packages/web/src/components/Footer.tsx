import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';

const Footer: React.FC = () => {
	return (
		<Box sx={{ backgroundColor: '#2c3e50', color: 'white', py: 6, mt: 8 }}>
			<Container maxWidth='lg'>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							md: 'repeat(4, 1fr)',
						},
						gap: 4,
						mb: 4,
					}}
				>
					{/* 加藤惠 Official */}
					<Box>
						<Typography
							variant='h6'
							sx={{ mb: 2, color: '#ff6b9d', fontWeight: 'bold' }}
						>
							♡ 加藤惠 Official
						</Typography>
						<Typography variant='body2' sx={{ lineHeight: 1.8 }}>
							致敬这位平凡却特别的女主角，感受她带给我们的温暖与感动。
						</Typography>
					</Box>

					{/* 快速链接 */}
					<Box>
						<Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
							快速链接
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								角色介绍
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								图片画廊
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								相关作品
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								视频
							</Typography>
						</Box>
					</Box>

					{/* 相关资源 */}
					<Box>
						<Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
							相关资源
						</Typography>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								官方网站
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								动画官网
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								原作小说
							</Typography>
							<Typography
								variant='body2'
								sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b9d' } }}
							>
								周边商品
							</Typography>
						</Box>
					</Box>

					{/* 联系我们 */}
					<Box>
						<Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
							联系我们
						</Typography>
						<Typography variant='body2' sx={{ mb: 2 }}>
							如果您有更多加藤惠相关资源，欢迎与我们交流！
						</Typography>
						<Button
							variant='outlined'
							size='small'
							sx={{
								color: '#ff6b9d',
								borderColor: '#ff6b9d',
								'&:hover': { backgroundColor: '#ff6b9d', color: 'white' },
							}}
						>
							关注
						</Button>
					</Box>
				</Box>

				{/* 版权信息 */}
				<Box
					sx={{ textAlign: 'center', pt: 4, borderTop: '1px solid #34495e' }}
				>
					<Typography variant='body2' color='#95a5a6'>
						© 2025 加藤惠粉丝网站.
						本站为非营利性质的粉丝网站，所有相关权利归原作者所有.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export default Footer;
