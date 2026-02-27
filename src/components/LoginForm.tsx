'use client';

import { useState, useCallback } from 'react';
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
    <div className="fixed inset-0 flex items-center justify-center bg-[#f2f0eb] z-[999] bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgba(212,128,10,0.08)_0%,transparent_70%)]">
      <div className="bg-white border border-[#e4e0d8] rounded-[20px] p-10 max-w-[380px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-[rise_.5s_cubic-bezier(.22,1,.36,1)]">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 bg-[#d4800a] rounded-xl flex items-center justify-center text-[22px] shrink-0">
            🍽
          </div>
          <div>
            <div className="font-heading font-black text-xl text-[#1a1816]">
              ร้าน<span className="text-[#d4800a]">อาหาร</span> POS
            </div>
            <div className="text-xs text-[#9a9288] mt-0.5">ระบบจัดการร้านอาหาร</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="block text-[11px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
            อีเมล
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-[10px] py-2.5 px-3.5 text-[#1a1816] font-sans text-sm mb-3.5 focus:outline-none focus:border-[#d4800a] placeholder:text-[#9a9288]"
            placeholder="admin@restaurant.com"
          />
          <label className="block text-[11px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-[10px] py-2.5 px-3.5 text-[#1a1816] font-sans text-sm mb-3.5 focus:outline-none focus:border-[#d4800a] placeholder:text-[#9a9288]"
            placeholder="••••••••"
          />
          <button
            type="submit"
            className="w-full bg-[#d4800a] border-none rounded-[10px] py-3 text-white font-heading font-extrabold text-[15px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            เข้าสู่ระบบ →
          </button>
        </form>
        <p className="text-center mt-3.5 text-xs text-[#9a9288]">
          Demo: <b>admin@restaurant.com</b> / <b>password</b>
        </p>
      </div>
    </div>
  );
}
