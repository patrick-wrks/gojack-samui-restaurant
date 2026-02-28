'use client';

import { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ERROR_INVALID_CREDENTIALS = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
const ERROR_NOT_CONFIGURED = 'แอปยังไม่ได้ตั้งค่า (ไม่มี Supabase) — กรุณาติดต่อผู้ดูแลระบบ';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!supabase) {
        setError(ERROR_NOT_CONFIGURED);
        return;
      }

      setSubmitting(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);

      if (signInError) {
        setError(ERROR_INVALID_CREDENTIALS);
        return;
      }
      // Success: onAuthStateChange in AuthProvider will set session; page.tsx redirects to /pos
    },
    [email, password]
  );

  const isConfigured = supabase !== null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f2f0eb] z-[999] bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgba(250,62,62,0.08)_0%,transparent_70%)] px-4 safe-top safe-bottom">
      <Card className="w-full max-w-[400px] md:max-w-[380px] border-[#e4e0d8] shadow-[0_20px_60px_rgba(0,0,0,0.1)] animate-[rise_.5s_cubic-bezier(.22,1,.36,1)] rounded-[24px] md:rounded-[20px] overflow-hidden min-w-0">
        <CardHeader className="pb-4">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-11 md:h-11 bg-[#FA3E3E] rounded-xl flex items-center justify-center text-[26px] md:text-[22px] shrink-0">
              🍽
            </div>
            <div>
              <CardTitle className="font-heading font-black text-xl md:text-xl text-[#1a1816] leading-tight">
                ร้าน<span className="text-[#FA3E3E]">อาหาร</span> POS
              </CardTitle>
              <p className="text-sm md:text-xs text-[#9a9288] mt-0.5">ระบบจัดการร้านอาหาร</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3.5">
            {error && (
              <div className="rounded-xl md:rounded-[10px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3 text-sm text-[#dc2626]">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2 md:space-y-1.5">
              <Label className="text-xs md:text-[11px] font-bold text-[#9a9288] uppercase tracking-wider">
                อีเมล
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@restaurant.com"
                disabled={!isConfigured}
                className={cn(
                  "bg-[#f7f5f0] border-[#e4e0d8] rounded-xl md:rounded-[10px]",
                  "py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm",
                  "placeholder:text-[#9a9288] touch-target",
                  "focus:border-[#FA3E3E] focus:ring-[#FA3E3E]/20"
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
                placeholder="••••••••"
                disabled={!isConfigured}
                className={cn(
                  "bg-[#f7f5f0] border-[#e4e0d8] rounded-xl md:rounded-[10px]",
                  "py-4 md:py-2.5 px-4 md:px-3.5 text-[#1a1816] font-sans text-base md:text-sm",
                  "placeholder:text-[#9a9288] touch-target",
                  "focus:border-[#FA3E3E] focus:ring-[#FA3E3E]/20"
                )}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={!isConfigured || submitting}
              className={cn(
                "w-full bg-[#FA3E3E] hover:bg-[#FA3E3E]/90 text-white",
                "rounded-xl md:rounded-[10px] py-4 md:py-3",
                "font-heading font-extrabold text-base md:text-[15px]",
                "touch-target flex items-center justify-center gap-2",
                "shadow-lg shadow-[#FA3E3E]/20 disabled:opacity-50"
              )}
            >
              {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-center mt-5 md:mt-3.5 text-sm md:text-xs text-[#9a9288] break-words overflow-hidden min-w-0">
            {isConfigured ? 'ใช้บัญชีพนักงานของร้าน' : ERROR_NOT_CONFIGURED}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
