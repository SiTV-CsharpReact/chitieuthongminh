"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { ChatbotWidget } from '@/components/ChatbotWidget';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'Admin') {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Optionally hide content entirely while redirecting
  if (!isLoading && isAuthenticated && user?.role === 'Admin') {
    return null;
  }

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
