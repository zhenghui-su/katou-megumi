import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import QRCode from 'qrcode';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface QrCodeLoginProps {
  onLoginSuccess: () => void;
}

const QrCodeLogin: React.FC<QrCodeLoginProps> = ({ onLoginSuccess }) => {
  const { setAuthData } = useAuth();
  const [_, setQrCodeId] = useState<string>('');
  const [status, setStatus] = useState<
    'pending' | 'scanned' | 'expired' | 'confirmed' | 'cancelled'
  >('pending');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码
  const generateQrCode = async () => {
    try {
      const response = await authAPI.generateQrCode();
      const { qrCodeId: newQrCodeId } = response.data.data;

      setQrCodeId(newQrCodeId);

      // 生成二维码内容（这里可以是一个包含qrCodeId的URL）
      const qrContent = `katou-megumi://qr-login?qrCodeId=${newQrCodeId}`;

      // 生成二维码图片
      // 等待下一个渲染周期，确保canvas元素已经渲染
      setTimeout(async () => {
        if (canvasRef.current) {
          try {
            await QRCode.toCanvas(canvasRef.current, qrContent, {
              width: 180,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
          } catch (error) {
            console.error('生成二维码图片失败:', error);
          }
        } else {
          console.error('Canvas元素不存在');
        }
      }, 100);

      setStatus('pending');
      startPolling(newQrCodeId);

      // 设置过期时间
      setTimeout(() => {
        if (status === 'pending') {
          setStatus('expired');
          stopPolling();
        }
      }, 5 * 60 * 1000); // 5分钟后过期
    } catch (error) {
      console.error('生成二维码失败:', error);
      message.error('生成二维码失败，请重试');
      setStatus('expired');
    }
  };

  // 开始轮询检查二维码状态
  const startPolling = (qrCodeId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await authAPI.checkQrCodeStatus(qrCodeId);

        const { status: qrStatus, token, user_data } = response.data.data;
        if (qrStatus === 'confirmed' && token && user_data) {
          // 登录成功
          setAuthData(user_data, token);
          message.success('扫码登录成功！');
          setStatus(qrStatus);
          stopPolling();
          onLoginSuccess();
        } else if (qrStatus === 'expired') {
          setStatus(qrStatus);
          stopPolling();
        } else if (qrStatus === 'scanned') {
          setStatus(qrStatus);
        } else if (qrStatus === 'pending') {
          setStatus('pending');
        } else if (qrStatus === 'cancelled') {
          console.log('检测到用户取消扫码');

          setStatus('cancelled');
          stopPolling();
        }
      } catch (error) {
        console.error('检查二维码状态失败:', error);
      }
    }, 2000); // 每2秒检查一次
  };

  // 停止轮询
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 组件挂载时生成二维码
  useEffect(() => {
    generateQrCode();

    // 组件卸载时清理
    return () => {
      stopPolling();
    };
  }, []);

  // 渲染状态内容
  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <canvas
            ref={canvasRef}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '8px',
            }}
          />
        );

      case 'scanned':
        return (
          <div
            style={{
              width: '180px',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1890ff',
              fontSize: '14px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>已扫描</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              请在手机上确认登录
            </div>
          </div>
        );

      case 'expired':
        return (
          <div
            style={{
              width: '180px',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            onClick={generateQrCode}
          >
            <div style={{ marginBottom: '8px' }}>二维码已过期</div>
            <div style={{ color: '#ff6b9d' }}>点击刷新</div>
          </div>
        );

      case 'cancelled':
        return (
          <div
            style={{
              width: '180px',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            onClick={generateQrCode}
          >
            <div style={{ marginBottom: '8px' }}>扫码已取消</div>
            <div style={{ color: '#ff6b9d' }}>点击刷新</div>
          </div>
        );

      case 'confirmed':
        return (
          <div
            style={{
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#52c41a',
              fontSize: '14px',
            }}
          >
            登录成功
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h3
        style={{
          color: 'white',
          marginBottom: '24px',
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '18px',
        }}
      >
        扫描二维码登录
      </h3>

      <div
        style={{
          width: '180px',
          height: '180px',
          backgroundColor: 'white',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {renderContent()}
      </div>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          lineHeight: '1.5',
          margin: 0,
          fontSize: '14px',
        }}
      >
        请使用手机APP
        <br />
        扫码快速登录
      </p>
    </div>
  );
};

export default QrCodeLogin;
