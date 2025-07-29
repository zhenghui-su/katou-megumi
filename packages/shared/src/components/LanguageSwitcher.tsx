import { useState } from 'react';
import {
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import { Language, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Language {
	code: string;
	name: string;
	flag: string;
}

const languages: Language[] = [
	{ code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
	{ code: 'en-US', name: 'English', flag: '🇺🇸' },
	{ code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
];

interface LanguageSwitcherProps {
	variant?: 'icon' | 'text';
	size?: 'small' | 'medium' | 'large';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
	variant = 'icon',
	size = 'medium',
}) => {
	const { i18n } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const currentLanguage =
		languages.find((lang) => lang.code === i18n.language) || languages[0];

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageChange = (languageCode: string) => {
		i18n.changeLanguage(languageCode);
		handleClose();
	};

	if (variant === 'text') {
		return (
			<>
				<Typography
					component='button'
					variant='body2'
					onClick={handleClick}
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						color: 'text.primary',
						'&:hover': {
							color: 'primary.main',
						},
					}}
				>
					<Language fontSize={size} />
					{currentLanguage.flag} {currentLanguage.name}
				</Typography>
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					{languages.map((language) => (
						<MenuItem
							key={language.code}
							onClick={() => handleLanguageChange(language.code)}
							selected={language.code === i18n.language}
						>
							<ListItemIcon>
								{language.code === i18n.language ? (
									<Check fontSize='small' />
								) : (
									<span style={{ fontSize: '16px', marginLeft: '2px' }}>
										{language.flag}
									</span>
								)}
							</ListItemIcon>
							<ListItemText primary={language.name} />
						</MenuItem>
					))}
				</Menu>
			</>
		);
	}

	return (
		<>
			<IconButton
				onClick={handleClick}
				size={size}
				sx={{
					color: 'text.primary',
					'&:hover': {
						color: 'primary.main',
						backgroundColor: 'rgba(255, 107, 157, 0.1)',
					},
				}}
				aria-label='change language'
			>
				<Language />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				PaperProps={{
					sx: {
						mt: 1,
						minWidth: 150,
					},
				}}
			>
				{languages.map((language) => (
					<MenuItem
						key={language.code}
						onClick={() => handleLanguageChange(language.code)}
						selected={language.code === i18n.language}
						sx={{
							'&.Mui-selected': {
								backgroundColor: 'primary.light',
								'&:hover': {
									backgroundColor: 'primary.light',
								},
							},
						}}
					>
						<ListItemIcon>
							{language.code === i18n.language ? (
								<Check fontSize='small' color='primary' />
							) : (
								<span style={{ fontSize: '16px', marginLeft: '2px' }}>
									{language.flag}
								</span>
							)}
						</ListItemIcon>
						<ListItemText
							primary={language.name}
							primaryTypographyProps={{
								fontWeight: language.code === i18n.language ? 'bold' : 'normal',
								color:
									language.code === i18n.language
										? 'primary.main'
										: 'text.primary',
							}}
						/>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
