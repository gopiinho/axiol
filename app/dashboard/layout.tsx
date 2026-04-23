import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { isAuthenticated } from "@/lib/auth-server";
import { UserProvider } from "@/features/auth/client/UserContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login");
  }

  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
