import { useState, useRef, useEffect } from 'react';
import {
	Box,
	IconButton,
	Slider,
	Typography,
	Paper,
	Collapse,
	List,
	ListItem,
	ListItemText,
	Avatar,
} from '@mui/material';
import {
	PlayArrow,
	Pause,
	SkipNext,
	SkipPrevious,
	VolumeUp,
	VolumeOff,
	QueueMusic,
	Album,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Track {
	id: number;
	title: string;
	artist: string;
	src: string;
	duration: number;
	cover?: string;
	category?: string;
	description?: string;
}

interface MusicPlayerProps {
	tracks?: Track[];
	autoPlay?: boolean;
	onTrackPlay?: (trackId: number) => void; // 播放回调，用于统计播放次数
	onTrackChange?: (track: Track) => void; // 切换歌曲回调
	empty?: boolean; // 是否为空状态
}

// 默认音乐数据
const defaultTracks: Track[] = [
	{
		id: 1,
		title: 'M♭',
		artist: '路人女主的养成方法 加藤惠角色歌',
		src: 'https://chen-1320883525.cos.ap-chengdu.myqcloud.com/music/%E8%B7%AF%E4%BA%BA%E5%A5%B3%E4%B8%BB%E7%9A%84%E5%85%BB%E6%88%90%E6%96%B9%E6%B3%95%20%E8%A7%92%E8%89%B2%E6%AD%8C%28%E5%8A%A0%E8%97%A4%E6%81%B5_CV_%E5%AE%89%E9%87%8E%E5%B8%8C%E4%B8%96%E4%B9%83%29.mp4',
		duration: 180,
		cover: 'https://chen-1320883525.cos.ap-chengdu.myqcloud.com/KatouMegumi/%E8%A7%92%E8%89%B2%E6%AD%8C%E5%B0%81%E9%9D%A2.jpg',
	},
];

const MusicPlayer: React.FC<MusicPlayerProps> = ({
	tracks = defaultTracks,
	onTrackPlay,
	onTrackChange,
	empty = false,
}) => {
	// 使用传入的 tracks 或默认数据
	const safeTracks = tracks && tracks.length > 0 ? tracks : defaultTracks;
	const { t } = useTranslation();
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTrack, setCurrentTrack] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.7);
	const [isMuted, setIsMuted] = useState(false);
	const [showPlaylist, setShowPlaylist] = useState(false);
	const [isMinimized, setIsMinimized] = useState(true);

	// 当 tracks 变化时重置当前播放索引
	useEffect(() => {
		if (safeTracks.length === 0) {
			setCurrentTrack(0);
			setIsPlaying(false);
		} else if (currentTrack >= safeTracks.length) {
			setCurrentTrack(0);
		}
	}, [safeTracks, currentTrack]);

	// 移除自动播放功能，让用户自己决定是否播放

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || safeTracks.length === 0) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);
		const handleEnded = () => {
			if (currentTrack < safeTracks.length - 1) {
				setCurrentTrack(currentTrack + 1);
			} else {
				setIsPlaying(false);
			}
		};

		// 当开始播放时，调用播放回调
		const handlePlay = () => {
			if (safeTracks[currentTrack] && onTrackPlay) {
				onTrackPlay(safeTracks[currentTrack].id);
			}
		};

		audio.addEventListener('timeupdate', updateTime);
		audio.addEventListener('loadedmetadata', updateDuration);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('play', handlePlay);

		return () => {
			audio.removeEventListener('timeupdate', updateTime);
			audio.removeEventListener('loadedmetadata', updateDuration);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('play', handlePlay);
		};
	}, [currentTrack, safeTracks, onTrackPlay]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.play().catch(console.error);
		} else {
			audio.pause();
		}
	}, [isPlaying, currentTrack]);

	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.volume = isMuted ? 0 : volume;
		}
	}, [volume, isMuted]);

	const togglePlay = () => {
		setIsPlaying(!isPlaying);
	};

	const previousTrack = () => {
		const newIndex = currentTrack > 0 ? currentTrack - 1 : safeTracks.length - 1;
		setCurrentTrack(newIndex);
		if (onTrackChange && safeTracks[newIndex]) {
			onTrackChange(safeTracks[newIndex]);
		}
	};

	const nextTrack = () => {
		const newIndex = currentTrack < safeTracks.length - 1 ? currentTrack + 1 : 0;
		setCurrentTrack(newIndex);
		if (onTrackChange && safeTracks[newIndex]) {
			onTrackChange(safeTracks[newIndex]);
		}
	};

	const handleSeek = (value: number) => {
		const audio = audioRef.current;
		if (audio) {
			audio.currentTime = value;
			setCurrentTime(value);
		}
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const selectTrack = (index: number) => {
		setCurrentTrack(index);
		setShowPlaylist(false);
		if (onTrackChange && safeTracks[index]) {
			onTrackChange(safeTracks[index]);
		}
	};

	// 空状态或无音乐数据
	if (empty || !safeTracks.length) {
		return null;
	}

	const track = safeTracks[currentTrack];

	return (
		<>
			<audio ref={audioRef} src={track.src} preload='metadata' />

			{/* 缩小状态 - 旋转唱片 */}
			{isMinimized && (
				<Box
					sx={{
						position: 'fixed',
						bottom: 20,
						right: 20,
						zIndex: 1000,
						cursor: 'pointer',
					}}
					onClick={() => setIsMinimized(false)}
				>
					<Paper
						elevation={12}
						sx={{
							width: 80,
							height: 80,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
							overflow: 'hidden',
							transition: 'all 0.3s ease',
							animation: isPlaying ? 'spin 3s linear infinite' : 'none',
							'@keyframes spin': {
								from: { transform: 'rotate(0deg)' },
								to: { transform: 'rotate(360deg)' },
							},
							'&:hover': {
								transform: isPlaying
									? 'scale(1.1) rotate(var(--rotation, 0deg))'
									: 'scale(1.1)',
								boxShadow: '0 8px 25px rgba(255, 107, 157, 0.4)',
							},
						}}
					>
						{/* 封面图片 */}
						{track.cover && (
							<Box
								sx={{
									position: 'absolute',
									width: '100%',
									height: '100%',
									borderRadius: '50%',
									backgroundImage: `url(${track.cover})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
									'&::after': {
										content: '""',
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										borderRadius: '50%',
										background: `
											radial-gradient(circle at center, 
												transparent 15px, 
												rgba(0,0,0,0.2) 16px, 
												transparent 17px, 
												rgba(0,0,0,0.1) 25px, 
												transparent 26px, 
												rgba(0,0,0,0.1) 30px, 
												transparent 31px
											)
										`,
									},
								}}
							/>
						)}

						{/* 默认渐变背景（当没有封面时） */}
						{!track.cover && (
							<Box
								sx={{
									position: 'absolute',
									width: '100%',
									height: '100%',
									borderRadius: '50%',
									background:
										'linear-gradient(45deg, #ff6b9d 30%, #ff8cc8 90%)',
									'&::after': {
										content: '""',
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										borderRadius: '50%',
										background: `
											radial-gradient(circle at center, 
												transparent 15px, 
												rgba(0,0,0,0.1) 16px, 
												transparent 17px, 
												rgba(0,0,0,0.05) 18px, 
												transparent 19px, 
												rgba(0,0,0,0.05) 25px, 
												transparent 26px, 
												rgba(0,0,0,0.05) 30px, 
												transparent 31px
											)
										`,
									},
								}}
							/>
						)}

						{/* 中心播放按钮 */}
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								togglePlay();
							}}
							aria-label={isPlaying ? t('player.pause') : t('player.play')}
							sx={{
								color: 'white',
								backgroundColor: 'rgba(0,0,0,0.3)',
								borderRadius: '50%',
								width: 30,
								height: 30,
								zIndex: 2,
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.5)',
								},
							}}
						>
							{isPlaying ? (
								<Pause sx={{ fontSize: 16 }} />
							) : (
								<PlayArrow sx={{ fontSize: 16 }} />
							)}
						</IconButton>
					</Paper>
				</Box>
			)}

			{/* 展开状态 - 完整播放器 */}
			{!isMinimized && (
				<Paper
					elevation={8}
					sx={{
						position: 'fixed',
						bottom: 20,
						right: 20,
						width: 350,
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
						borderRadius: 3,
						overflow: 'hidden',
						transition: 'all 0.3s ease',
						zIndex: 1000,
					}}
				>
					{/* 头部信息 */}
					<Box sx={{ p: 2 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								mb: 2,
							}}
						>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									flex: 1,
									minWidth: 0,
								}}
							>
								{/* 封面图片 */}
								<Avatar
									src={track.cover}
									sx={{
										width: 40,
										height: 40,
										mr: 2,
										background: !track.cover
											? 'linear-gradient(45deg, #ff6b9d 30%, #ff8cc8 90%)'
											: 'transparent',
										animation: isPlaying ? 'spin 3s linear infinite' : 'none',
										'@keyframes spin': {
											from: { transform: 'rotate(0deg)' },
											to: { transform: 'rotate(360deg)' },
										},
									}}
								>
									{!track.cover && <Album sx={{ color: 'white' }} />}
								</Avatar>

								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										variant='subtitle2'
										sx={{
											fontWeight: 'bold',
											color: 'primary.main',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{track.title}
									</Typography>
									<Typography
										variant='caption'
										color='text.secondary'
										sx={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{track.artist}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: 'flex', gap: 1 }}>
								<IconButton
									onClick={() => setShowPlaylist(!showPlaylist)}
									size='small'
									aria-label={t('player.playlist')}
								>
									<QueueMusic />
								</IconButton>
								<IconButton
									onClick={() => setIsMinimized(true)}
									size='small'
									aria-label='minimize player'
									sx={{
										color: 'text.secondary',
										'&:hover': { color: 'primary.main' },
									}}
								>
									<Album />
								</IconButton>
							</Box>
						</Box>

						{/* 进度条 */}
						<Box sx={{ mb: 2 }}>
							<Slider
								value={currentTime}
								max={duration || 100}
								onChange={(_, value) => handleSeek(value as number)}
								size='small'
								sx={{
									color: 'primary.main',
									'& .MuiSlider-thumb': {
										width: 12,
										height: 12,
									},
								}}
							/>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant='caption' color='text.secondary'>
									{formatTime(currentTime)}
								</Typography>
								<Typography variant='caption' color='text.secondary'>
									{formatTime(duration)}
								</Typography>
							</Box>
						</Box>

						{/* 控制按钮和音量控制 */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 2,
								mt: 1,
							}}
						>
							{/* 播放控制按钮 */}
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1,
								}}
							>
								<IconButton 
									onClick={previousTrack} 
									size='small'
									aria-label={t('player.previous')}
								>
									<SkipPrevious />
								</IconButton>
								<IconButton
									onClick={togglePlay}
									aria-label={isPlaying ? t('player.pause') : t('player.play')}
									sx={{
										backgroundColor: 'primary.main',
										color: 'white',
										'&:hover': {
											backgroundColor: 'primary.dark',
										},
									}}
								>
									{isPlaying ? <Pause /> : <PlayArrow />}
								</IconButton>
								<IconButton 
									onClick={nextTrack} 
									size='small'
									aria-label={t('player.next')}
								>
									<SkipNext />
								</IconButton>
							</Box>

							{/* 音量控制 */}
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1,
									flex: 1,
									maxWidth: 140,
								}}
							>
								<IconButton 
									onClick={toggleMute} 
									size='small'
									aria-label={isMuted ? t('player.volume') : t('player.mute')}
								>
									{isMuted ? <VolumeOff /> : <VolumeUp />}
								</IconButton>
								<Slider
									value={isMuted ? 0 : volume * 100}
									onChange={(_, value) => setVolume((value as number) / 100)}
									size='small'
									sx={{
										flex: 1,
										color: 'primary.main',
										'& .MuiSlider-thumb': {
											width: 12,
											height: 12,
										},
									}}
								/>
								<Typography
									variant='caption'
									color='text.secondary'
									sx={{
										minWidth: 30,
										textAlign: 'right',
										fontWeight: 'bold',
									}}
								>
									{Math.round(isMuted ? 0 : volume * 100)}%
								</Typography>
							</Box>
						</Box>
					</Box>

					{/* 播放列表 */}
					<Collapse in={showPlaylist}>
						<Box sx={{ borderTop: 1, borderColor: 'divider' }}>
							<List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
						{safeTracks.map((track, index) => (
									<ListItem
										key={track.id}
										component='div'
										onClick={() => selectTrack(index)}
										sx={{
											cursor: 'pointer',
											backgroundColor:
												index === currentTrack
													? 'primary.light'
													: 'transparent',
											'&:hover': {
												backgroundColor:
													index === currentTrack
														? 'primary.light'
														: 'action.hover',
											},
										}}
									>
										<ListItemText
											primary={track.title}
											secondary={track.artist}
											primaryTypographyProps={{
												variant: 'body2',
												sx: {
													fontWeight:
														index === currentTrack ? 'bold' : 'normal',
												},
											}}
											secondaryTypographyProps={{
												variant: 'caption',
											}}
										/>
									</ListItem>
								))}
							</List>
						</Box>
					</Collapse>
				</Paper>
			)}
		</>
	);
};

export default MusicPlayer;
