"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <LoginModal />
      <ChatbotWidget />
    </div>
  );
}
