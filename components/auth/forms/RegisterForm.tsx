'use client';

/**
 * Register Form Component
 * Handles user registration with email/password and social login
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
// import type { RegisterData } from '@/lib/auth/config/auth-types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className = '',
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState<any>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    score: number;
    feedback: string[];
  }>({ isValid: false, score: 0, feedback: [] });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Check password strength
    if (name === 'password') {
      const strength = { score: value.length >= 8 ? 3 : value.length >= 6 ? 2 : 1, feedback: [] };
      setPasswordStrength({
        isValid: value.length >= 8,
        score: strength.score,
        feedback: strength.feedback,
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Họ tên là bắt buộc';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (!passwordStrength.isValid) {
      newErrors.password = passwordStrength.feedback?.[0] || 'Mật khẩu không đủ mạnh';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await register(formData);
      
      if (error) {
        toast({
          title: 'Đăng ký thất bại',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Đăng ký thành công',
        description: 'Vui lòng kiểm tra email để xác nhận tài khoản',
      });

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/auth/login?message=check-email');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: 'Lỗi đăng ký',
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Get password strength color
  const getPasswordStrengthColor = (score: number): string => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    if (score >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get password strength text
  const getPasswordStrengthText = (score: number): string => {
    if (score >= 4) return 'Mạnh';
    if (score >= 3) return 'Trung bình';
    if (score >= 2) return 'Yếu';
    return 'Rất yếu';
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng ký
          </h2>
          <p className="text-gray-600">
            Tạo tài khoản mới để bắt đầu
          </p>
        </div>


        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Họ tên *
            </Label>
            <div className="relative mt-1">
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Nhập họ tên của bạn"
                className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <div className="relative mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Số điện thoại
            </Label>
            <div className="relative mt-1">
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0123456789"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mật khẩu *
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback && passwordStrength.feedback.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-600">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>• {feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Xác nhận mật khẩu *
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
                Đang tạo tài khoản...
              </>
            ) : (
              'Tạo tài khoản'
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={onSwitchToLogin}
              disabled={isSubmitting}
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
