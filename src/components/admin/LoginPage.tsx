// ================================================================
// src/components/admin/LoginPage.tsx
// ================================================================
'use client';

import React, { useState } from 'react';
import { setAdminToken } from '@/lib/admin';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // In production: validate with backend
    if (password === 'admin123') {
      // Use the secure admin token that matches backend
      const token = 'sc_admin_eca6f7927c384d75b9cf9e5fc00e06f8';
      setAdminToken(token);
      onLogin(token);
    } else {
      setError('كلمة المرور غير صحيحة');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg mx-auto mb-4">
            🍦
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Soft Cream Admin
          </h1>
          <p className="text-gray-600 mt-2">تسجيل الدخول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">❌ {error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              للتجربة استخدم: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 Soft Cream. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;