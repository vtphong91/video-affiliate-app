'use client';

/**
 * Forgot Password Form Component
 * Handles password reset requests
 */

import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/providers/SupabaseAuthProvider';
// Removed authHelpers import

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
  className = '',
}) => {
  const { toast } = useToast();
  const { resetPassword, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  // Validate email
  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email là bắt buộc');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword({ email });
      
      if (error) {
        toast({
          title: 'Gửi email thất bại',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitted(true);
      
      toast({
        title: 'Email đã được gửi',
        description: 'Vui lòng kiểm tra hộp thư để đặt lại mật khẩu',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Lỗi gửi email',
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend email
  const handleResend = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword({ email });
      
      if (error) {
        toast({
          title: 'Gửi email thất bại',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Email đã được gửi lại',
        description: 'Vui lòng kiểm tra hộp thư',
      });
    } catch (error) {
      console.error('Resend email error:', error);
      toast({
        title: 'Lỗi gửi email',
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email đã được gửi
          </h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              Hướng dẫn tiếp theo:
            </h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Kiểm tra hộp thư đến của bạn</li>
              <li>• Click vào link trong email</li>
              <li>• Tạo mật khẩu mới</li>
              <li>• Đăng nhập với mật khẩu mới</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi lại email'
              )}
            </Button>
            
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </div>

          {/* Help Text */}
          <p className="mt-4 text-xs text-gray-500">
            Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quên mật khẩu
          </h2>
          <p className="text-gray-600">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`pl-10 ${error ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi email...
              </>
            ) : (
              'Gửi link đặt lại mật khẩu'
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center space-x-1"
            onClick={onBackToLogin}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại đăng nhập</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ. 
            Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam.
          </p>
        </div>
      </div>
    </div>
  );
};
