import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AuthGuard } from '@/components/AuthGuard';
import { MenuLoader } from '@/components/MenuLoader';
import { StoreLoader } from '@/components/StoreLoader';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MenuLoader />
      <StoreLoader />
      <div className="h-screen-safe flex flex-col bg-[#f2f0eb] min-w-0 overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden min-w-0 min-h-0">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-hidden flex min-w-0 min-h-0">{children}</main>
        </div>
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
