import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { isAuthenticated } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
