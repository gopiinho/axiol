import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getSessionTokenFromCookies,
  verifyAdminSession,
} from "@/server/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const validSession = await verifyAdminSession(token);
  if (!validSession) {
    redirect("/api/auth/logout?next=/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
