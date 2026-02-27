'use client';

import { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <Card className="w-full max-w-[400px] md:max-w-[380px] border-[#e4e0d8] shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-[rise_.5s_cubic-bezier(.22,1,.36,1)] rounded-[24px] md:rounded-[20px]">
        <CardHeader className="pb-4">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-11 md:h-11 bg-[#d4800a] rounded-xl flex items-center justify-center text-[26px] md:text-[22px] shrink-0">
              🍽
            </div>
            <div>
              <CardTitle className="font-heading font-black text-xl md:text-xl text-[#1a1816] leading-tight">
                ร้าน<span className="text-[#d4800a]">อาหาร</span> POS
              </CardTitle>
              <p className="text-sm md:text-xs text-[#9a9288] mt-0.5">ระบบจัดการร้านอาหาร</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3.5">
            {/* Email Field */}
            <div className="space-y-2 md:space-y-1.5">
              <Label className="text-xs md:text-[11px] font-bold text-[#9a9288] uppercase tracking-wider">
                อีเมล
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                className={cn(
                  "bg-[#f7f5f0] border-[#e4e0d8] rounded-xl md:rounded-[10px]",
                  "py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm",
                  "placeholder:text-[#9a9288] touch-target",
                  "focus:border-[#d4800a] focus:ring-[#d4800a]/20"
                )}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 md:space-y-1.5">
              <Label className="text-xs md:text-[11px] font-bold text-[#9a9288] uppercase tracking-wider">
                รหัสผ่าน
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="••••••••"
                className={cn(
                  "bg-[#f7f5f0] border-[#e4e0d8] rounded-xl md:rounded-[10px]",
                  "py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm",
                  "placeholder:text-[#9a9288] touch-target",
                  "focus:border-[#d4800a] focus:ring-[#d4800a]/20"
                )}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className={cn(
                "w-full bg-[#d4800a] hover:bg-[#d4800a]/90 text-white",
                "rounded-xl md:rounded-[10px] py-4 md:py-3",
                "font-heading font-extrabold text-base md:text-[15px]",
                "touch-target flex items-center justify-center gap-2",
                "shadow-lg shadow-[#d4800a]/20"
              )}
            >
              เข้าสู่ระบบ
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Demo Info */}
          <p className="text-center mt-5 md:mt-3.5 text-sm md:text-xs text-[#9a9288]">
            Demo: <b>admin@restaurant.com</b> / <b>password</b>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
