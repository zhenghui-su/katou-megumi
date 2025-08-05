import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import { UserProvider } from './contexts/UserContext';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#6366f1',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
        },
        components: {
          Card: {
            borderRadius: 16,
            boxShadowTertiary: '0 8px 32px rgba(99, 102, 241, 0.12)',
          },
          Button: {
            borderRadius: 8,
            primaryShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
          },
          Input: {
            borderRadius: 8,
          },
          Select: {
            borderRadius: 8,
          },
        },
      }}
    >
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </Router>
      </UserProvider>
    </ConfigProvider>
  );
}

export default App;
