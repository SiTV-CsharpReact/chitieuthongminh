import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import InputExpenses from './pages/InputExpenses';
import Recommendations from './pages/Recommendations';
import CardDetail from './pages/CardDetail';
import News from './pages/News';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/input" element={<InputExpenses />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/card/:id" element={<CardDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;