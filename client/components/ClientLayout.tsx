import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { LoginModal } from './LoginModal';

const ClientLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <LoginModal />
        </div>
    );
};

export default ClientLayout;
