
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Simulate checking local storage on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string) => {
    // Mock login - in a real app this would verify credentials
    const newUser: User = {
      id: 'user_123',
      name: email.split('@')[0], // Default name from email
      email: email,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3stPn7feWNJ1BrnWyVPbCNE7JruRX8xSWedHlGUtk1L3wYCOfo6slieggrpIiB3y1DuhKRYVjqf9cuyiRJNRKM7EY9pd1_HsQJGsZI_AmGGRQCJe42wqd3XVIxmC7IcbPr1x8wCDCwYQbPFiVdB0beziRc4_ohjun9MKJvLRUjmc2ppNBsTCZbo3gBrcPHfejRF__4SfHknoJBy-MqXMsNGlbOCiqYb76gUoPmgsOr9T-KyQdyZhpZj0k89Viseuw6X1-lU0GrIo4' // Mock Avatar
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoginModalOpen(false); // Close modal on successful login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoginModalOpen,
      login, 
      logout, 
      updateUser,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
