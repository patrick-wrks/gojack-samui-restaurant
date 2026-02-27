import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AuthGuard } from '@/components/AuthGuard';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-[#f2f0eb]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-hidden flex">{children}</main>
        </div>
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
