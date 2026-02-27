'use client';

import { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/providers';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      login();
    },
    [login]
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f2f0eb] z-[999] bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgba(212,128,10,0.08)_0%,transparent_70%)] px-4 safe-top safe-bottom">
      <div className="bg-white border border-[#e4e0d8] rounded-[24px] md:rounded-[20px] p-6 md:p-10 w-full max-w-[400px] md:max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-[rise_.5s_cubic-bezier(.22,1,.36,1)]">
        {/* Logo Header */}
        <div className="flex items-center gap-3 mb-8 md:mb-7">
          <div className="w-12 h-12 md:w-11 md:h-11 bg-[#d4800a] rounded-xl md:rounded-xl flex items-center justify-center text-[26px] md:text-[22px] shrink-0">
            🍽
          </div>
          <div>
            <div className="font-heading font-black text-xl md:text-xl text-[#1a1816]">
              ร้าน<span className="text-[#d4800a]">อาหาร</span> POS
            </div>
            <div className="text-sm md:text-xs text-[#9a9288] mt-0.5">ระบบจัดการร้านอาหาร</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <label className="block text-xs md:text-[11px] font-bold text-[#9a9288] uppercase tracking-wider mb-2 md:mb-1.5">
            อีเมล
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-xl md:rounded-[10px] py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm mb-4 md:mb-3.5 focus:outline-none focus:border-[#d4800a] focus:ring-2 focus:ring-[#d4800a]/20 placeholder:text-[#9a9288] touch-target"
            placeholder="admin@restaurant.com"
          />

          {/* Password Field */}
          <label className="block text-xs md:text-[11px] font-bold text-[#9a9288] uppercase tracking-wider mb-2 md:mb-1.5">
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-xl md:rounded-[10px] py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm mb-6 md:mb-3.5 focus:outline-none focus:border-[#d4800a] focus:ring-2 focus:ring-[#d4800a]/20 placeholder:text-[#9a9288] touch-target"
            placeholder="••••••••"
          />

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#d4800a] border-none rounded-xl md:rounded-[10px] py-4 md:py-3 text-white font-heading font-extrabold text-base md:text-[15px] cursor-pointer active:opacity-90 transition-opacity touch-target flex items-center justify-center gap-2 shadow-lg shadow-[#d4800a]/20"
          >
            เข้าสู่ระบบ
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Demo Info */}
        <p className="text-center mt-5 md:mt-3.5 text-sm md:text-xs text-[#9a9288]">
          Demo: <b>admin@restaurant.com</b> / <b>password</b>
        </p>
      </div>
    </div>
  );
}
