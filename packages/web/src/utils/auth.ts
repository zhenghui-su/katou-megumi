/**
 * 认证相关的工具函数
 */

// 密码强度检测函数
export const getPasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  strength = Object.values(checks).filter(Boolean).length;

  return {
    score: strength,
    checks,
    level: strength < 2 ? 'exception' : strength < 4 ? 'normal' : 'success',
    percentage: (strength / 4) * 100,
  };
};

// 表单验证函数
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string) => {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

// 验证注册表单
export const validateRegisterForm = (registerForm: {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}) => {
  const errors: string[] = [];

  if (!validateUsername(registerForm.username)) {
    errors.push('用户名至少3个字符，只能包含字母、数字和下划线');
  }
  if (!validateEmail(registerForm.email)) {
    errors.push('请输入有效的邮箱地址');
  }
  if (registerForm.password.length < 6) {
    errors.push('密码至少6个字符');
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.push('两次输入的密码不一致');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};