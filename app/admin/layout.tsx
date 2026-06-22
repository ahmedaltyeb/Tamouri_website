import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" dir="ltr">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-stone-50">
        {children}
      </main>
    </div>
  );
}
