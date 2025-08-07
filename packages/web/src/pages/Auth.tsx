import React, { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Modal, Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AuthDialogProps } from '../types/auth';
import { getPasswordStrength, validateRegisterForm } from '../utils/auth';

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose }) => {
  const { login, register, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  // 密码强度
  const passwordStrength = getPasswordStrength(registerForm.password);

  // 重置表单
  const resetForms = () => {
    setLoginForm({ username: '', password: '' });
    setRegisterForm({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
    });
    setActiveTab('1');
  };

  // 验证注册表单
  const validateForm = () => {
    const validation = validateRegisterForm(registerForm);
    if (!validation.isValid) {
      validation.errors.forEach(error => message.error(error));
      return false;
    }
    return true;
  };

  // 处理登录
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      message.error('请填写完整的登录信息');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(loginForm.username, loginForm.password);
      if (success) {
        message.success('登录成功！');
        onClose();
        resetForms();
      }
      // 错误信息已经在AuthContext中通过useEffect显示了
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await register(
        registerForm.username,
        registerForm.email,
        registerForm.password
      );
      if (success) {
        message.success('注册成功！请登录。');
        setActiveTab('1');
        setRegisterForm({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
        });
      }
      // 错误信息已经在AuthContext中通过useEffect显示了
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      resetForms();
    }
  }, [open]);

  // 显示错误信息
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // MUI Modal会自动处理滚动禁用，所以移除自定义的滚动处理逻辑

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="auth-modal"
      aria-describedby="auth-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '700px',
          height: '430px',
          background:
            'linear-gradient(135deg, rgba(255, 107, 157, 0.95), rgba(255, 139, 171, 0.9))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(255, 107, 157, 0.3)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          outline: 'none',
        }}
      >
        {/* 关闭按钮 */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            width: '32px',
            height: '32px',
            zIndex: 10,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* 左侧二维码区域 */}
        <div
          style={{
            flex: '0 0 300px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
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
            <span style={{ color: '#999', fontSize: '14px' }}>二维码</span>
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

        {/* 右侧表单区域 */}
        <div
          style={{
            flex: 1,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* 标签页切换 */}
          <div
            style={{
              display: 'flex',
              marginTop: '0px',
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setActiveTab('1')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '12px',
                color:
                  activeTab === '1' ? '#ff6b9d' : 'rgba(255, 255, 255, 0.7)',
                background: activeTab === '1' ? 'white' : 'transparent',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
              }}
            >
              密码登录
            </button>
            <button
              onClick={() => setActiveTab('2')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '12px',
                color:
                  activeTab === '2' ? '#ff6b9d' : 'rgba(255, 255, 255, 0.7)',
                background: activeTab === '2' ? 'white' : 'transparent',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
              }}
            >
              注册账号
            </button>
          </div>

          {/* 表单内容 */}
          <div style={{ flex: 'none' }}>
            {activeTab === '1' ? (
              // 登录表单
              <div style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                <div
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'right',
                    }}
                  >
                    账号
                  </label>
                  <Input
                    placeholder="请输入账号"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      fontSize: '14px',
                      flex: 1,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'right',
                    }}
                  >
                    密码
                  </label>
                  <Input.Password
                    placeholder="请输入密码"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      fontSize: '14px',
                      flex: 1,
                    }}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={
                    isSubmitting ||
                    loading ||
                    !loginForm.username ||
                    !loginForm.password
                  }
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'white',
                    color: '#ff6b9d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 107, 157, 0.3)',
                    cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
                    opacity:
                      isSubmitting ||
                      loading ||
                      !loginForm.username ||
                      !loginForm.password
                        ? 0.6
                        : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isSubmitting || loading ? '登录中...' : '登录'}
                </button>
              </div>
            ) : (
              // 注册表单
              <div>
                <div
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'right',
                    }}
                  >
                    账号
                  </label>
                  <Input
                    placeholder="请输入帐号"
                    value={registerForm.username}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        username: e.target.value,
                      })
                    }
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      fontSize: '14px',
                      flex: 1,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'right',
                    }}
                  >
                    邮箱
                  </label>
                  <Input
                    placeholder="请输入邮箱"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      fontSize: '14px',
                      flex: 1,
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <label
                      style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '14px',
                        fontWeight: 500,
                        minWidth: '60px',
                        textAlign: 'right',
                      }}
                    >
                      密码
                    </label>
                    <Input.Password
                      placeholder="请输入密码"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      style={{
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        fontSize: '14px',
                        flex: 1,
                      }}
                    />
                  </div>
                  {registerForm.password && (
                    <div style={{ marginTop: '6px', marginLeft: '72px' }}>
                      <div
                        style={{
                          height: '3px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${passwordStrength.percentage}%`,
                            background:
                              passwordStrength.level === 'exception'
                                ? '#ff6b9d'
                                : passwordStrength.level === 'normal'
                                ? '#ffc0cb'
                                : '#4caf50',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.8)',
                          marginTop: '2px',
                          textAlign: 'right',
                        }}
                      >
                        密码强度:{' '}
                        {passwordStrength.level === 'exception'
                          ? '弱'
                          : passwordStrength.level === 'normal'
                          ? '中'
                          : '强'}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <label
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '60px',
                      textAlign: 'right',
                    }}
                  >
                    确认密码
                  </label>
                  <Input.Password
                    placeholder="请再次输入密码"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      fontSize: '14px',
                      flex: 1,
                    }}
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isSubmitting || loading}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'white',
                    color: '#ff6b9d',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 107, 157, 0.3)',
                    cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || loading ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isSubmitting || loading ? '注册中...' : '注册'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default AuthDialog;
