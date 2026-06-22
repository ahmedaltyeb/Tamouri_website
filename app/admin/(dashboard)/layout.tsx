import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "../_components/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Defense-in-depth: middleware already blocks, this catches any edge cases.
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" dir="ltr">
      <AdminSidebar
        userName={session.user?.name ?? "Admin"}
        userEmail={session.user?.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto bg-stone-50">{children}</main>
    </div>
  );
}
