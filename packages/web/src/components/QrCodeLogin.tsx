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
    'loading' | 'pending' | 'scanned' | 'expired' | 'confirmed'
  >('loading');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码
  const generateQrCode = async () => {
    try {
      setStatus('loading');
      const response = await authAPI.generateQrCode();
      const { qrCodeId: newQrCodeId } = response.data.data;

      setQrCodeId(newQrCodeId);

      // 生成二维码内容（这里可以是一个包含qrCodeId的URL）
      const qrContent = `katou-megumi://qr-login?qrCodeId=${newQrCodeId}`;

      // 生成二维码图片
      // 等待下一个渲染周期，确保canvas元素已经渲染
      setTimeout(async () => {
        if (canvasRef.current) {
          console.log('Canvas元素存在，开始生成二维码图片...');
          try {
            await QRCode.toCanvas(canvasRef.current, qrContent, {
              width: 180,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
            console.log('二维码图片生成成功');
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

    console.log('开始轮询二维码状态，qrCodeId:', qrCodeId);
    intervalRef.current = setInterval(async () => {
      try {
        console.log('检查二维码状态...');
        const response = await authAPI.checkQrCodeStatus(qrCodeId);
        console.log('二维码状态检查响应:', JSON.stringify(response.data, null, 2));
        const { status: qrStatus, token, user_data } = response.data.data;
        console.log('二维码状态:', qrStatus, '是否有token:', !!token, '是否有用户数据:', !!user_data);

        if (qrStatus === 'confirmed' && token && user_data) {
          // 登录成功
          console.log('二维码登录成功，保存token和用户数据:', token, user_data);
          setAuthData(user_data, token);
          message.success('扫码登录成功！');
          setStatus('confirmed');
          stopPolling();
          onLoginSuccess();
        } else if (qrStatus === 'expired') {
          console.log('二维码已过期');
          setStatus('expired');
          stopPolling();
        } else if (qrStatus === 'scanned') {
          console.log('二维码已被扫描，等待确认');
          setStatus('scanned');
        } else if (qrStatus === 'pending') {
          console.log('二维码状态为pending，重新生成二维码');
          setStatus('pending');
          stopPolling();
          generateQrCode();
        } else {
          console.log('二维码状态为:', qrStatus);
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
      case 'loading':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '180px',
              color: '#999',
              fontSize: '14px',
            }}
          >
            生成中...
          </div>
        );

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
            <div style={{ fontSize: '12px', color: '#999' }}>请在手机上确认登录</div>
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
