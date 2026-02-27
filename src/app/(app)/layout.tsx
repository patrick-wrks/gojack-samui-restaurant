import { Topbar } from '@/components/Topbar';
import { Sidebar } from '@/components/Sidebar';
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
          <Sidebar />
          <main className="flex-1 overflow-hidden flex">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
