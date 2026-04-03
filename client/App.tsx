
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import InputExpenses from './pages/InputExpenses';
import Recommendations from './pages/Recommendations';
import CardDetail from './pages/CardDetail';
import Compare from './pages/Compare';
import News from './pages/News';
import Settings from './pages/Settings';
import AllCards from './pages/AllCards';
import AdminCards from './pages/AdminCards';
import AdminCategories from './pages/AdminCategories';
import AdminDashboard from './pages/AdminDashboard';
import AdminArticles from './pages/AdminArticles';
import ArticleDetail from './pages/ArticleDetail';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminGuard from './components/AdminGuard';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import ClientLayout from './components/ClientLayout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CompareProvider>
          <BrowserRouter>
            <Routes>
              {/* Client-Facing Routes with Header */}
              <Route element={<ClientLayout />}>
                <Route path="/" element={<Welcome />} />
                <Route path="/input" element={<InputExpenses />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/card/:id" element={<CardDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/cards" element={<AllCards />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<ArticleDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Admin Portal Routes - No Client Header */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="cards" element={<AdminCards />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="users" element={<div className="p-10 text-slate-500 font-bold">Quản lý người dùng (Coming Soon)</div>} />
                <Route path="settings" element={<div className="p-10 text-slate-500 font-bold">Cài đặt hệ thống (Coming Soon)</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CompareProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
