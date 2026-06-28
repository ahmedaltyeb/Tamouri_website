import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "../_components/AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Defense-in-depth: middleware already blocks, this catches any edge cases.
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      userName={session.user?.name ?? "Admin"}
      userEmail={session.user?.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
