import React from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { Notification } from '../types/notification';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotification();
  // const [loadingMore, setLoadingMore] = useState(false);

  React.useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications();
    }
  }, [open]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '🔔';
      case 'review':
        return '✅';
      case 'user':
        return '👤';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'primary';
      case 'review':
        return 'success';
      case 'user':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
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
          width: 400,
          maxHeight: 500,
          mt: 1,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <NotificationsIcon color="primary" />
            通知中心
          </Typography>
          {notifications.some((n) => !n.isRead) && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkReadIcon />}
            >
              全部已读
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">暂无通知</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 1,
                    backgroundColor: notification.isRead
                      ? 'transparent'
                      : 'action.hover',
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flex: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {getNotificationIcon(notification.type)}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={
                            notification.type === 'system'
                              ? '系统'
                              : notification.type === 'review'
                              ? '审核'
                              : '用户'
                          }
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                          variant="outlined"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notification.content}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.createdAt)}
                      </Typography>
                      {notification.sender && (
                        <Typography variant="caption" color="text.secondary">
                          来自: {notification.sender.username}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                // 这里可以跳转到完整的通知页面
                onClose();
              }}
            >
              查看全部通知
            </Button>
          </Box>
        )}
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
