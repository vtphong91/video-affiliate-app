'use client';

/**
 * Login Modal Component
 * Modal wrapper for login form
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from '../forms/LoginForm';
import { RegisterForm } from '../forms/RegisterForm';
import { ForgotPasswordForm } from '../forms/ForgotPasswordForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'register' | 'forgot-password';
}

type ModalView = 'login' | 'register' | 'forgot-password';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  defaultView = 'login',
}) => {
  const [currentView, setCurrentView] = useState<ModalView>(defaultView);

  // Handle success
  const handleSuccess = () => {
    onClose();
  };

  // Handle view switch
  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal content */}
          <div className="mt-2">
            {currentView === 'login' && (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={handleSwitchToRegister}
                onForgotPassword={handleSwitchToForgotPassword}
              />
            )}

            {currentView === 'register' && (
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            )}

            {currentView === 'forgot-password' && (
              <ForgotPasswordForm
                onSuccess={handleBackToLogin}
                onBackToLogin={handleBackToLogin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};










