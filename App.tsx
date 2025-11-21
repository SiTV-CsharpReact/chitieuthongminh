
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import InputExpenses from './pages/InputExpenses';
import Recommendations from './pages/Recommendations';
import CardDetail from './pages/CardDetail';
import Compare from './pages/Compare';
import News from './pages/News';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CompareProvider>
          <HashRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
              <Header />
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/input" element={<InputExpenses />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/card/:id" element={<CardDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/news" element={<News />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <LoginModal />
            </div>
          </HashRouter>
        </CompareProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
